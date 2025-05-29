// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { AppDataSource } from "../../utils/data/db";
import { Ship } from "../../utils/data/entity/Ship";

/**
 * Command to show the user's shipping statistics.
 * This command retrieves the shipping data for the user in the guild,
 * counts how many times the user has been shipped,
 * and replies with the shipping statistics.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If the command is not used in a guild or if there is no shipping data found.
 */
export const mystats: Command = {
  data: new SlashCommandBuilder()
    .setName("mystats")
    .setDescription("Shows your shipping statistics"),

  async execute(interaction: CommandInteraction) {
    // no need to check if it's in guild
    const userId = interaction.user.id;
    const ship = await AppDataSource.getRepository(Ship).findOne({
      where: { id: interaction.guild!.id },
      select: {
        pairsCount: true,
      },
    });

    if (!ship || !ship.pairsCount) {
      await interaction.reply({
        content: "No shipping data found.",
        flags: 64 // Ephemeral
      });
      return;
    }

    // Count how many times the user has been shipped
    const count = Object.entries(ship.pairsCount).reduce((acc, [pairKey, pairCount]) => {
      const [id1, id2] = pairKey.split('-');
      if (id1 === userId || id2 === userId) {
        return acc + pairCount;
      }
      return acc;
    }, 0);

    if (count === 0) {
      await interaction.reply({
        content: "You have not been shipped in this server yet.",
        flags: 64 // Ephemeral
      });
      return;
    }

    // Reply with the shipping statistics
    await interaction.reply({
      content: `**Your Shipping Statistics:**\n\nYou have been shipped **${count}** times in this server.`,
    });
  }
}