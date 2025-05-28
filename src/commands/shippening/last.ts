// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { loadData } from "./data";

/**
 * last command for Discord bot.
 * This command retrieves and displays the last shipped pair of users in the server.
 * It checks if the last pair exists and if the members are still in the server.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the last command.
 * @property {function} execute - The function that executes the command when invoked.
 * * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const last: Command = {
  data: new SlashCommandBuilder()
    .setName("last")
    .setDescription("Shows the last shipped pair"),

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const data = await loadData();

    if (!data.lastPair) {
      await interaction.reply("No pairs have been shipped yet.");
      return;
    }

    const [m1, m2] = data.lastPair;
    const member1 = await interaction.guild.members.fetch(m1).catch(() => null);
    const member2 = await interaction.guild.members.fetch(m2).catch(() => null);

    if (!member1 || !member2) {
      await interaction.reply("One of the members in the last pair is no longer in the server.");
      return;
    }

    await interaction.reply(
      `**Last Shipped Pair:**\n\n<@${member1.id}> ❤️ <@${member2.id}>\n\n`
    );
  }
}