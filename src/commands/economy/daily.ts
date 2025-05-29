// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import * as dotenv from "dotenv";
import { Command } from "../../interfaces/types";
import { convertDiscordUserToUser } from "../../utils/utils";
import { AppDataSource } from "../../utils/data/db";
import { User } from "../../utils/data/entity/User";

dotenv.config();

const DAILY_AMOUNT = parseInt(process.env.DAILY_REWARD ?? "100");

/**
 * Command to claim daily rewards in the economy system.
 * This command allows users to claim a daily reward of fops.
 * It checks if the user has already claimed their daily reward within the last 24 hours.
 * If they have, it informs them of the remaining time until they can claim again.
 * If not, it updates their balance and last daily claim time.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If the user has already claimed their daily reward within the last 24 hours.
 */
export const daily: Command = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward for some free fops! 🦊"),

  async execute(interaction) {
    const user = await convertDiscordUserToUser(interaction.user)!;

    // Load user data from the database
    const userRepository = AppDataSource.getRepository(User);
    let dbUser = await userRepository.findOne({ where: { id: user.id } });
    if (!dbUser) {
      // If user does not exist, create a new user with default data
      dbUser = new User(user.id, 0, undefined, undefined, undefined);
      await userRepository.save(dbUser);
    }

    // Get: Current time
    const currentTime = Date.now()
    // Check: if user already got daily reward
    if (dbUser.lastDaily && currentTime - dbUser.lastDaily < 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
      // Calculate remaining time until next daily claim
      const remainingTime = 24 * 60 * 60 * 1000 - (currentTime - dbUser.lastDaily);
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      await interaction.reply({
        content: `You have already claimed your daily reward! Come back in **${hours}h ${minutes}m ${seconds}s** to claim again!`,
        flags: 64, // Ephemeral
      });
      return;
    }
    // Update the user's balance and last daily claim time
    dbUser.balance += DAILY_AMOUNT;
    dbUser.lastDaily = currentTime;
    await userRepository.save(dbUser);
    // Reply to the user with the daily reward message
    await interaction.reply({
      content: `You have claimed your daily reward of **${DAILY_AMOUNT}** fops! 🦊\n\nCome back tomorrow for more!`,
      flags: 64, // Ephemeral
    });
  },
};
