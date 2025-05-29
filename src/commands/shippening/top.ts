// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { ensureInGuild } from "../../utils/utils";
import { AppDataSource } from "../../utils/data/db";
import { Ship } from "../../utils/data/entity/Ship";

/**
 * Command to show the top 10 most shipped pairs in the server.
 * This command fetches the ship data from the database,
 * retrieves the pairsCount, sorts them by count, and formats the output.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the top command.
 * @property {Function} execute - The function to execute when the command is called.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 * @throws {Error} - If the command is executed outside of a guild or if no pairs are found.
 */
export const top: Command = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Shows the top 10 most shipped pairs in the server"),
  
  async execute(interaction) {
    if (!(await ensureInGuild(interaction))) return;

    // Fetch the top pairs from the Database
    const ship = await AppDataSource.getRepository(Ship).findOne({
      where: { id: interaction.guild!.id },
    });
    if (!ship || !ship.pairsCount) {
      await interaction.reply({
        content: "No pairs found in the top list.",
        ephemeral: true
      });
      return;
    }
    // Convert pairsCount to an array of [pairKey, count] tuples
    const pairsArray = Object.entries(ship.pairsCount)
      .map(([pairKey, count]) => ({ pairKey, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
    // Get the top 10 pairs
    const topPairs = pairsArray.slice(0, 10);
    if (topPairs.length === 0) {
      await interaction.reply({
        content: "No pairs found in the top list.",
        ephemeral: true
      });
      return;
    }

    // Format the message with the top pairs
    let msg = "**Top 10 Shipped Pairs:**\n\n";
    for (const { pairKey, count } of topPairs) {
      const [id1, id2] = pairKey.split('-');
      const member1 = await interaction.guild!.members.fetch(id1).catch(() => null);
      const member2 = await interaction.guild!.members.fetch(id2).catch(() => null);

      if (member1 && member2) {
        msg += `<@${member1.id}> ❤️ <@${member2.id}> - **${count}**\n`;
      } else {
        msg += `Unknown members in pair: <@${id1}> ❤️ <@${id2}> - **${count}**\n`;
      }
    }

    // Reply with the formatted message
    const embed = new EmbedBuilder()
      .setTitle("Top 10 Shipped Pairs")
      .setDescription(msg)
      .setColor(0x00ff00);
    await interaction.reply({ embeds: [embed], flags: 64 }); // Ephemeral
  }
}