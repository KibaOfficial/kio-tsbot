// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { addMoney, removeMoney } from "../data";
import { AppDataSource } from "../../../utils/data/db";
import { User } from "../../../utils/data/entity/User";
import { ResponseBuilder } from "../../../utils/responses";

/**
 * Coinflip game implementation for the economy system.
 * Players bet on heads or tails and can win double their bet if they guess correctly.
 * The game includes visual coin flip animation and multiplier support.
 */

const coinSides = [
  { side: "heads", emoji: "🪙", display: "**HEADS**" },
  { side: "tails", emoji: "🥏", display: "**TAILS**" }
];

/**
 * Simulates a coin flip and returns the result.
 * @returns {object} The result containing side, emoji, and display text
 */
function flipCoin(): { side: string; emoji: string; display: string } {
  const randomIndex = Math.floor(Math.random() * coinSides.length);
  return coinSides[randomIndex];
}

/**
 * Creates an animated coin flip embed with spinning effect.
 * @param {string} playerChoice - The player's choice (heads or tails)
 * @param {number} bet - The bet amount
 * @param {any} client - The Discord client
 * @returns {any} The animated embed
 */
function createFlipAnimationEmbed(playerChoice: string, bet: number, client: any) {
  return ResponseBuilder.economy(
    "🪙 Coin Flip",
    `**Your Choice:** ${playerChoice.toUpperCase()}\n` +
    `**Bet Amount:** ${bet.toLocaleString()} fops 🦊\n\n` +
    `🌪️ *The coin is spinning...*\n\n` +
    `⚪ ⚫ ⚪ ⚫ ⚪`,
    client
  );
}

/**
 * Creates the final result embed showing win/loss.
 * @param {string} playerChoice - The player's choice
 * @param {object} result - The coin flip result
 * @param {number} bet - The bet amount
 * @param {boolean} won - Whether the player won
 * @param {number} winnings - The total winnings (if won)
 * @param {boolean} hasMultiplier - Whether player has active multiplier
 * @param {any} client - The Discord client
 * @returns {any} The result embed
 */
function createResultEmbed(
  playerChoice: string,
  result: { side: string; emoji: string; display: string },
  bet: number,
  won: boolean,
  winnings: number,
  hasMultiplier: boolean,
  client: any
) {
  if (won) {
    return ResponseBuilder.economy(
      "🪙 Coin Flip Result",
      `**Your Choice:** ${playerChoice.toUpperCase()}\n` +
      `**Result:** ${result.emoji} ${result.display}\n\n` +
      `🎉 **CONGRATULATIONS!** 🎉\n` +
      `You guessed correctly!\n\n` +
      `**Bet:** ${bet.toLocaleString()} fops 🦊\n` +
      `**Base Winnings:** ${(bet * 2).toLocaleString()} fops 🦊\n` +
      `${hasMultiplier ? `**Multiplier Applied:** +50% bonus!\n` : ''}` +
      `**Total Winnings:** ${winnings.toLocaleString()} fops 🦊\n\n` +
      `💰 **Net Profit:** +${(winnings - bet).toLocaleString()} fops 🦊`,
      client
    ).setColor("#00FF00");
  } else {
    return ResponseBuilder.economy(
      "🪙 Coin Flip Result",
      `**Your Choice:** ${playerChoice.toUpperCase()}\n` +
      `**Result:** ${result.emoji} ${result.display}\n\n` +
      `😔 **Better luck next time!**\n` +
      `You guessed wrong.\n\n` +
      `**Lost:** ${bet.toLocaleString()} fops 🦊\n\n` +
      `💡 **Tip:** It's a 50/50 chance - try again!`,
      client
    ).setColor("#FF0000");
  }
}

/**
 * Plays a coinflip game for the user.
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction
 * @param {string} choice - Player's choice (heads or tails)
 * @param {number} bet - The bet amount
 * @param {boolean} hasMultiplier - Whether the user has an active multiplier
 */
export async function playCoinflip(
  interaction: ChatInputCommandInteraction,
  choice: string,
  bet: number,
  hasMultiplier: boolean
): Promise<void> {
  try {
    // Validate choice
    const validChoices = ["heads", "tails"];
    if (!validChoices.includes(choice.toLowerCase())) {
      await interaction.reply({
        content: "❌ Invalid choice! Please choose either 'heads' or 'tails'.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Get user data
    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { id: interaction.user.id } });
    
    if (!user) {
      user = new User(interaction.user.id, 0, undefined, undefined, undefined);
      await userRepo.save(user);
    }    // Check if user has enough balance
    const userBalance = Number(user.balance) || 0;
    if (userBalance < bet) {
      await interaction.reply({
        content: `❌ Insufficient balance! You need ${bet.toLocaleString()} fops 🦊 but only have ${userBalance.toLocaleString()} fops 🦊.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    console.log(`[COINFLIP] User ${interaction.user.id} is playing coinflip with choice: ${choice}, bet: ${bet} fops 🦊.`);

    // Remove bet from balance
    await removeMoney(user, bet);

    // Send initial animation
    const animationEmbed = createFlipAnimationEmbed(choice, bet, interaction.client);
    await interaction.reply({ embeds: [animationEmbed] });

    // Wait for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Flip the coin
    const result = flipCoin();
    const playerWon = choice.toLowerCase() === result.side;
    
    let totalWinnings = 0;
    if (playerWon) {
      // Calculate winnings (2x bet)
      let baseWinnings = bet * 2;
      
      // Apply multiplier if active
      if (hasMultiplier) {
        totalWinnings = Math.floor(baseWinnings * 1.5); // 50% bonus
        console.log(`[COINFLIP] Multiplier applied! Base: ${baseWinnings}, Total: ${totalWinnings}`);
      } else {
        totalWinnings = baseWinnings;
      }
      
      // Add winnings to balance
      await addMoney(user, totalWinnings);
      console.log(`[COINFLIP] User ${interaction.user.id} won ${totalWinnings} fops 🦊!`);
    } else {
      console.log(`[COINFLIP] User ${interaction.user.id} lost ${bet} fops 🦊.`);
    }    // Send result
    const resultEmbed = createResultEmbed(choice, result, bet, playerWon, totalWinnings, hasMultiplier, interaction.client);
    await interaction.editReply({ embeds: [resultEmbed] });

  } catch (error) {
    console.error(`[COINFLIP] Error in coinflip game:`, error);
    
    const errorEmbed = ResponseBuilder.error(
      "Game Error",
      "An error occurred while playing coinflip. Please try again later.",
      interaction.client
    );
      
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [errorEmbed] });
    } else {
      await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }
  }
}

/**
 * Simple coinflip function for the main play command (random choice).
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction
 * @param {number} bet - The amount to bet
 * @param {boolean} hasMultiplier - Whether the player has an active multiplier
 */
export async function playCoinflipSimple(interaction: ChatInputCommandInteraction, bet: number, hasMultiplier: boolean = false) {
  // For the main play command, we'll randomly choose heads or tails for the player
  const choice = Math.random() < 0.5 ? 'heads' : 'tails';
  await playCoinflip(interaction, choice, bet, hasMultiplier);
}
