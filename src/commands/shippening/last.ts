// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { ensureInGuild } from "../../utils/utils";
import { AppDataSource } from "../../utils/data/db";
import { Ship } from "../../utils/data/entity/Ship";

/**
 * Command to show the last shipped pair in the guild.
 * This command fetches the last pair from the Ship entity in the database
 * and replies with the members of that pair.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for Discord interactions.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @return {Promise<void>} - A promise that resolves when the command execution is complete.
 * @throws {Error} - If the command is used outside of a guild or if no pairs have been shipped yet.
 * @throws {Error} - If one of the members in the last pair is no longer in the server.
 */
export const last: Command = {
  data: new SlashCommandBuilder()
    .setName("last")
    .setDescription("Shows the last shipped pair"),

  async execute(interaction) {
    // Check: In Guild
    if (!(await ensureInGuild(interaction))) return;
    
    // fetch ship from database
    const ship = await AppDataSource.getRepository(Ship).findOne({
      where: { id: interaction.guild!.id },
    });

    if (!ship || !ship.lastPair) {
      await interaction.reply({
        content: "No pairs have been shipped yet.",
        flags: 64 // Ephemeral
      });
      return;
    }

    // Get the last pair from the ship data
    const [m1, m2] = ship.lastPair;
    // Fetch the members from the guild
    const member1 = await interaction.guild!.members.fetch(m1).catch(() => null);
    const member2 = await interaction.guild!.members.fetch(m2).catch(() => null);

    if (!member1 || !member2) {
      await interaction.reply({
        content: "One of the members in the last pair is no longer in the server.",
        flags: 64 // Ephemeral
      });
      return;
    }

    // Reply with the last shipped pair
    await interaction.reply(
      `**Last Shipped Pair:**\n\n<@${member1.id}> ❤️ <@${member2.id}>\n\n`
    );
  }
}