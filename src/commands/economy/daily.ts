// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import * as dotenv from "dotenv";
import { Command } from "../../interfaces/types";
import { convertDiscordUserToUser } from "../../utils/utils";
import { AppDataSource } from "../../utils/data/db";
import { User } from "../../utils/data/entity/User";
import { ResponseBuilder } from "../../utils/responses";

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
    const lastDaily = Number(dbUser.lastDaily) || 0;
    if (dbUser.lastDaily && currentTime - lastDaily < 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
      // Calculate remaining time until next daily claim
      const remainingTime = 24 * 60 * 60 * 1000 - (currentTime - lastDaily);
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      
      const embed = ResponseBuilder.warning(
        "Daily Already Claimed",
        `You have already claimed your daily reward!\n\n⏰ **Come back in:** ${hours}h ${minutes}m ${seconds}s`,
        interaction.client
      );
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral, // Ephemeral
      });
      return;
    }
    // Update the user's balance and last daily claim time
    dbUser.balance = (Number(dbUser.balance) || 0) + DAILY_AMOUNT;
    dbUser.lastDaily = currentTime;
    await userRepository.save(dbUser);
    
    // Reply to the user with the daily reward message
    const embed = ResponseBuilder.economy(
      "Daily Reward Claimed!",
      `You have claimed your daily reward of **${DAILY_AMOUNT}** fops! 🦊\n\n💰 **New Balance:** ${dbUser.balance} fops\n⏰ **Come back tomorrow for more!**`,
      interaction.client
    );
    
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral, // Ephemeral
    });
  },
};
