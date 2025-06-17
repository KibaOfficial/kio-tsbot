// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { addMoney, removeMoney } from "../data";
import { AppDataSource } from "../../../utils/data/db";
import { User } from "../../../utils/data/entity/User";
import { ResponseBuilder } from "../../../utils/responses";

const slotEmojis = [
  { emoji: "🍒", multiplier: 3 },
  { emoji: "🍋", multiplier: 2 },
  { emoji: "🍊", multiplier: 1.5 },
  { emoji: "🍉", multiplier: 1.2 },
  { emoji: "🍇", multiplier: 1.1 },
  { emoji: "7️⃣", multiplier: 5 },
]

/**
 * Returns a random emoji from the slot machine emojis.
 * The emojis are predefined with their respective multipliers.
 * This function is used to simulate a slot machine spin.
 * @returns {string} A random emoji from the slot machine emojis.
 */
function getRandomEmoji() {
  const index = Math.floor(Math.random() * slotEmojis.length);
  return slotEmojis[index].emoji;
}

/**
 * Plays the slot machine game.
 * It removes the bet amount from the user's balance,
 * spins the slot machine, and determines if the user wins or loses.
 * If the user wins, it adds the reward to their balance.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from Discord.
 * @param {number} bet - The amount of money the user is betting.
 * @throws {Error} If the user does not have enough money to play.
 * @returns {Promise<void>} A promise that resolves when the game is played.
 */
export async function playSlots(interaction: ChatInputCommandInteraction, bet: number, activeMultiplier: boolean = false): Promise<void> {
  const userId = interaction.user.id;
  console.log(`[SLOTS] User ${userId} is playing slots with a bet of ${bet} fops 🦊.`);
  
  // Get: user from database
  const userRepo = AppDataSource.getRepository(User);
  let user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    // If user does not exist, create a new user with default
    user = new User(userId, 0, undefined, undefined, undefined);
    await userRepo.save(user);
    console.log(`[SLOTS] Created new user ${userId} with default balance.`);
    const embed = ResponseBuilder.economy(
      "Welcome to Slots!",
      "🎰 Welcome to the slot machine! You have been given **0 fops 🦊**. Please earn some money before playing!",
      interaction.client
    );
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await removeMoney(user!, bet);
  } catch (error) {
    console.error(`[SLOTS] Error removing money for user ${userId}:`, error);
    const embed = ResponseBuilder.error(
      "Insufficient Balance",
      `❌ You don't have enough fops 🦊 to play! You need at least **${bet.toLocaleString()} fops 🦊**.`,
      interaction.client
    );
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const spin = [
    getRandomEmoji(),
    getRandomEmoji(),
    getRandomEmoji(),
  ]
  const [first, second, third ] = spin;
  console.log(`[SLOTS] User ${userId} spun: ${spin.join(" ")}`);


  let win = false;
  let reward = 0;

  if (first === second && second === third) {
    win = true;
    const match = slotEmojis.find((e) => e.emoji === first);
    const multiplier = match?.multiplier ?? 1;
    reward = Math.floor(bet * multiplier);
    // add x2 if activeMultiplier
    await addMoney(user, reward * (activeMultiplier ? 2 : 1));
    console.log(`[SLOTS] User ${userId} won ${reward * (activeMultiplier ? 2 : 1)} fops 🦊 with multiplier ${activeMultiplier ? "active" : "inactive"}!`);
  } else {
    console.log(`[ECO]  `)
    console.log(`[SLOTS] User ${userId} lost ${bet} fops 🦊.`);
  }
  await interaction.reply({
    embeds: [
      ResponseBuilder.economy(
        "🎰 Slot Machine Result",
        win 
          ? `🎉 **YOU WIN!**\n\n**Spin Result:** ${spin.join(" ")}\n**Bet:** ${bet.toLocaleString()} fops 🦊\n**Base Winnings:** ${reward.toLocaleString()} fops 🦊${activeMultiplier ? `\n**Multiplier Bonus:** +${reward.toLocaleString()} fops 🦊\n**Total Winnings:** ${(reward * 2).toLocaleString()} fops 🦊` : `\n**Total Winnings:** ${reward.toLocaleString()} fops 🦊`}`
          : `💔 **YOU LOST!**\n\n**Spin Result:** ${spin.join(" ")}\n**Lost:** ${bet.toLocaleString()} fops 🦊\n\n💡 **Tip:** Match all 3 symbols to win!`,
        interaction.client
      )
    ]
  });
}
