// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { loadData } from "./data";

/**
 * Mystats command for Discord bot.
 * This command retrieves and displays the shipping statistics for the user who invoked it.
 * It counts how many times the user has been shipped in the server.
 * * @type {Command}
 * * @property {SlashCommandBuilder} data - The command data for the mystats command.
 * * @property {function} execute - The function that executes the command when invoked.
 * * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const mystats: Command = {
  data: new SlashCommandBuilder()
    .setName("mystats")
    .setDescription("Shows your shipping statistics"),

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const userId = interaction.user.id;
    const data = await loadData();

    let count = 0;

    for (const pairKey in data.pairsCount) {
      if (pairKey.includes(userId)) {
        count += data.pairsCount[pairKey];
      }
    }

    await interaction.reply({
      content: `**Your Shipping Statistics:**\n\nYou have been shipped **${count}** times in this server.`,
    })

  }
}