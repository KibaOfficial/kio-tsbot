// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { AppDataSource } from "../../utils/data/db";
import { User } from "../../utils/data/entity/User";


/**
 * Command to check the user's balance in the economy system.
 * This command retrieves the user's balance from the database.
 * If the user does not exist, it creates a new user with a default balance.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If there is an issue retrieving or creating the user data.
 */
export const balance: Command = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance in the economy system."),

  execute: async (interaction) => {
    // Get user data from the database
    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOne({
      where: { id: interaction.user.id },
    });

    if (!user) {
      // If user does not exist, create a new user with default
      user = new User(
        interaction.user.id,
        0, // Initial balance
        undefined, // lastDaily
        undefined, // inventory
        undefined, // multiplierExpiresAt
      );
      await userRepo.save(user);
      await interaction.reply({
        content: `Your balance is: **${user.balance}** fops 🦊\n\nWelcome to the economy system!`,
        flags: 64, // Ephemeral
      });
      return;
    }

    await interaction.reply({
      content:
        `Your balance is: **${user.balance}** fops 🦊\n\n`,
        flags: 64, // Ephemeral
    });
  },
};
