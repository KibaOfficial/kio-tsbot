// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getUserData } from "./data";

/**
 * Balance command for Discord bot.
 * This command allows users to check their balance in the economy system.
 * It retrieves the user's balance from the database and sends a reply with the balance amount.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the balance command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const balance: Command = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance in the economy system."),

  execute: async (interaction) => {
    const userId = interaction.user.id;
    const userData = await getUserData(userId);

    await interaction.reply({
      content:
        `Your balance is: **${userData.balance}** fops 🦊\n\n`,
        flags: 64, // Ephemeral
    });
  },
};
