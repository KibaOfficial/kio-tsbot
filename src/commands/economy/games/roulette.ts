// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { addMoney, removeMoney } from "../data";
import { AppDataSource } from "../../../utils/data/db";
import { User } from "../../../utils/data/entity/User";
import { ResponseBuilder } from "../../../utils/responses";

/**
 * Roulette game implementation for the economy system.
 * Players can bet on various outcomes like specific numbers, colors, or ranges.
 * Features realistic wheel animation and multiple betting options with different payouts.
 */

// Roulette wheel layout (European style with 37 numbers: 0-36)
const rouletteWheel = [
  { number: 0, color: 'green', emoji: '🟢' },
  { number: 32, color: 'red', emoji: '🔴' }, { number: 15, color: 'black', emoji: '⚫' },
  { number: 19, color: 'red', emoji: '🔴' }, { number: 4, color: 'black', emoji: '⚫' },
  { number: 21, color: 'red', emoji: '🔴' }, { number: 2, color: 'black', emoji: '⚫' },
  { number: 25, color: 'red', emoji: '🔴' }, { number: 17, color: 'black', emoji: '⚫' },
  { number: 34, color: 'red', emoji: '🔴' }, { number: 6, color: 'black', emoji: '⚫' },
  { number: 27, color: 'red', emoji: '🔴' }, { number: 13, color: 'black', emoji: '⚫' },
  { number: 36, color: 'red', emoji: '🔴' }, { number: 11, color: 'black', emoji: '⚫' },
  { number: 30, color: 'red', emoji: '🔴' }, { number: 8, color: 'black', emoji: '⚫' },
  { number: 23, color: 'red', emoji: '🔴' }, { number: 10, color: 'black', emoji: '⚫' },
  { number: 5, color: 'red', emoji: '🔴' }, { number: 24, color: 'black', emoji: '⚫' },
  { number: 16, color: 'red', emoji: '🔴' }, { number: 33, color: 'black', emoji: '⚫' },
  { number: 1, color: 'red', emoji: '🔴' }, { number: 20, color: 'black', emoji: '⚫' },
  { number: 14, color: 'red', emoji: '🔴' }, { number: 31, color: 'black', emoji: '⚫' },
  { number: 9, color: 'red', emoji: '🔴' }, { number: 22, color: 'black', emoji: '⚫' },
  { number: 18, color: 'red', emoji: '🔴' }, { number: 29, color: 'black', emoji: '⚫' },
  { number: 7, color: 'red', emoji: '🔴' }, { number: 28, color: 'black', emoji: '⚫' },
  { number: 12, color: 'red', emoji: '🔴' }, { number: 35, color: 'black', emoji: '⚫' },
  { number: 3, color: 'red', emoji: '🔴' }, { number: 26, color: 'black', emoji: '⚫' }
];

// Bet types and their payouts
const betTypes = {
  // Single number bet (35:1 payout)
  straight: { payout: 35, description: "Single Number" },
  // Color bets (1:1 payout)
  red: { payout: 1, description: "Red" },
  black: { payout: 1, description: "Black" },
  // Even/Odd bets (1:1 payout)
  even: { payout: 1, description: "Even" },
  odd: { payout: 1, description: "Odd" },
  // Range bets (1:1 payout)
  low: { payout: 1, description: "Low (1-18)" },
  high: { payout: 1, description: "High (19-36)" },
  // Column bets (2:1 payout)
  first12: { payout: 2, description: "First 12 (1-12)" },
  second12: { payout: 2, description: "Second 12 (13-24)" },
  third12: { payout: 2, description: "Third 12 (25-36)" }
};

/**
 * Spins the roulette wheel and returns a random result.
 * @returns {object} The winning number with its properties
 */
function spinWheel(): { number: number; color: string; emoji: string } {
  const randomIndex = Math.floor(Math.random() * rouletteWheel.length);
  return rouletteWheel[randomIndex];
}

/**
 * Determines if a bet wins based on the result.
 * @param {string} betType - The type of bet placed
 * @param {string|number} betValue - The specific value bet on
 * @param {object} result - The wheel spin result
 * @returns {boolean} Whether the bet wins
 */
function checkWin(betType: string, betValue: string | number, result: any): boolean {
  switch (betType) {
    case 'straight':
      return result.number === parseInt(betValue as string);
    case 'red':
      return result.color === 'red';
    case 'black':
      return result.color === 'black';
    case 'even':
      return result.number !== 0 && result.number % 2 === 0;
    case 'odd':
      return result.number !== 0 && result.number % 2 === 1;
    case 'low':
      return result.number >= 1 && result.number <= 18;
    case 'high':
      return result.number >= 19 && result.number <= 36;
    case 'first12':
      return result.number >= 1 && result.number <= 12;
    case 'second12':
      return result.number >= 13 && result.number <= 24;
    case 'third12':
      return result.number >= 25 && result.number <= 36;
    default:
      return false;
  }
}

/**
 * Creates an animated roulette wheel spinning embed.
 * @param {string} betType - The type of bet placed
 * @param {string|number} betValue - The specific value bet on
 * @param {number} bet - The bet amount
 * @returns {EmbedBuilder} The animated embed
 */
function createSpinAnimationEmbed(betType: string, betValue: string | number, bet: number, client: any) {
  const betDescription = betType === 'straight' ? `Number ${betValue}` : betTypes[betType as keyof typeof betTypes]?.description || betType;
  
  return ResponseBuilder.economy(
    "🎰 Roulette Wheel",
    `**Your Bet:** ${betDescription}\n` +
    `**Bet Amount:** ${bet.toLocaleString()} fops 🦊\n\n` +
    `🌪️ *The wheel is spinning...*\n\n` +
    `🔴 ⚫ 🟢 ⚫ 🔴 ⚫ 🔴\n` +
    `⚡ **SPINNING** ⚡`,
    client
  );
}

/**
 * Creates the result embed showing the wheel outcome.
 * @param {object} result - The wheel spin result
 * @param {string} betType - The type of bet placed
 * @param {string|number} betValue - The specific value bet on
 * @param {number} bet - The bet amount
 * @param {boolean} won - Whether the player won
 * @param {number} winnings - The amount won (0 if lost)
 * @param {boolean} hasMultiplier - Whether player has active multiplier
 * @param {any} client - The Discord client
 * @returns {any} The result embed
 */
function createResultEmbed(
  result: any, 
  betType: string, 
  betValue: string | number, 
  bet: number, 
  won: boolean, 
  winnings: number, 
  hasMultiplier: boolean,
  client: any
) {
  const betDescription = betType === 'straight' ? `Number ${betValue}` : betTypes[betType as keyof typeof betTypes]?.description || betType;
  const payout = betTypes[betType as keyof typeof betTypes]?.payout || 0;
  
  if (won) {
    const multiplierBonus = hasMultiplier ? Math.floor(winnings * 0.5) : 0;
    const totalWinnings = winnings + multiplierBonus;
    
    let description = `**Winning Number:** ${result.emoji} **${result.number}** (${result.color.toUpperCase()})\n\n` +
      `**Your Bet:** ${betDescription}\n` +
      `**Bet Amount:** ${bet.toLocaleString()} fops 🦊\n` +
      `**Payout Ratio:** ${payout + 1}:1\n\n` +
      `🎉 **YOU WON!** **+${winnings.toLocaleString()} fops** 🦊`;
    
    if (hasMultiplier) {
      description += `\n🚀 **Multiplier Bonus:** **+${multiplierBonus.toLocaleString()} fops** 🦊\n💰 **Total Winnings:** **${totalWinnings.toLocaleString()} fops** 🦊`;
    }
    
    return ResponseBuilder.economy(
      "🎰 Roulette Result",
      description,
      client
    ).setColor("#00FF00");
  } else {
    return ResponseBuilder.economy(
      "🎰 Roulette Result",
      `**Winning Number:** ${result.emoji} **${result.number}** (${result.color.toUpperCase()})\n\n` +
      `**Your Bet:** ${betDescription}\n` +
      `**Bet Amount:** ${bet.toLocaleString()} fops 🦊\n` +
      `**Payout Ratio:** ${payout + 1}:1\n\n` +
      `💸 **YOU LOST!** **-${bet.toLocaleString()} fops** 🦊`,
      client
    ).setColor("#FF0000");
  }
}

/**
 * Main roulette game function.
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction
 * @param {string} betType - The type of bet to place
 * @param {string|number} betValue - The specific value to bet on (for straight bets)
 * @param {number} bet - The amount to bet
 * @param {boolean} hasMultiplier - Whether the player has an active multiplier
 */
export async function playRoulette(
  interaction: ChatInputCommandInteraction, 
  betType: string, 
  betValue: string | number, 
  bet: number, 
  hasMultiplier: boolean = false
) {
  try {
    const userId = interaction.user.id;
    console.log(`[ROULETTE] User ${userId} is playing roulette with a bet of ${bet} fops 🦊.`);
    
    // Validate bet type
    if (betType === 'straight') {
      const num = parseInt(betValue as string);
      if (isNaN(num) || num < 0 || num > 36) {
        await interaction.reply({
          content: "❌ Invalid number! Please choose a number between 0 and 36.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }
    } else if (!betTypes[betType as keyof typeof betTypes]) {
      await interaction.reply({
        content: "❌ Invalid bet type! Please choose a valid betting option.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Get user from database
    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User(userId, 0, undefined, undefined, undefined);
      await userRepo.save(user);
      console.log(`[ROULETTE] Created new user ${userId} with default balance.`);
      await interaction.reply({
        content: `❌ You need some fops to play! You have been registered with **0 fops 🦊**. Please earn some money first!`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }    // Check if user has enough balance
    const userBalance = Number(user.balance) || 0;
    if (userBalance < bet) {
      await interaction.reply({
        content: `❌ You don't have enough fops! You have **${userBalance.toLocaleString()}** fops 🦊 but need **${bet.toLocaleString()}** fops 🦊.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Remove bet amount from user's balance
    await removeMoney(user, bet);

    // Show spinning animation
    const spinEmbed = createSpinAnimationEmbed(betType, betValue, bet, interaction.client);
    await interaction.reply({ embeds: [spinEmbed] });

    // Wait for dramatic effect (3 seconds for roulette)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Spin the wheel
    const result = spinWheel();
    const won = checkWin(betType, betValue, result);
    
    let winnings = 0;
    if (won) {
      const payout = betTypes[betType as keyof typeof betTypes]?.payout || 0;
      winnings = bet * (payout + 1); // Include original bet in winnings
      
      // Add multiplier bonus if active
      if (hasMultiplier) {
        const bonus = Math.floor(winnings * 0.5);
        winnings += bonus;
      }
        // Add winnings to user's balance
      await addMoney(user, winnings);
    }    
    // Show result
    const resultEmbed = createResultEmbed(result, betType, betValue, bet, won, winnings, hasMultiplier, interaction.client);
    await interaction.editReply({ embeds: [resultEmbed] });

    // Log the game result
    console.log(`[ECO] ${interaction.user.username} played roulette - Bet: ${bet}, Result: ${result.number} (${result.color}), Won: ${won}, Winnings: ${winnings}`);

  } catch (error) {
    console.error("[ECO] Error in roulette game:", error);
    await interaction.reply({
      content: "❌ An error occurred while playing roulette. Please try again later.",
      flags: MessageFlags.Ephemeral
    }).catch(() => {
      // If reply fails, try editing the reply
      interaction.editReply({
        content: "❌ An error occurred while playing roulette. Please try again later."
      }).catch(console.error);
    });
  }
}

/**
 * Simple roulette function for the main play command (red/black only).
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction
 * @param {number} bet - The amount to bet
 * @param {boolean} hasMultiplier - Whether the player has an active multiplier
 */
export async function playRouletteSimple(interaction: ChatInputCommandInteraction, bet: number, hasMultiplier: boolean = false) {
  // For the main play command, we'll use a simple red/black choice
  const choice = Math.random() < 0.5 ? 'red' : 'black';
  await playRoulette(interaction, choice, '', bet, hasMultiplier);
}
