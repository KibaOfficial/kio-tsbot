// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";

/**
 * Invite command for Discord bot.
 * This command replies with the bot's invite link, allowing users to invite the bot to their servers.
 * It uses the bot's client ID and predefined permissions to generate the invite URL.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the invite command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const invite: Command = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Replies with the bot's invite link"),
  async execute(interaction) {
    const clientId = process.env.BOT_ID;
    if (!clientId) {
      console.log("[Invite] Bot ID is not set in the environment variables.");
      await interaction.reply("[Invite] Bot ID is not set in the environment variables.");
      return;
    }

    const permissions = 8; // Administrator-Permissions
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&integration_type=0&scope=bot`;
    await interaction.reply({
      content: `You can invite me using this link: [Invite Link](${inviteUrl})`,
      flags: 64, // Ephemeral
    });
    console.log(`[Invite] Invite link sent: ${inviteUrl}\nRequested by: ${interaction.user.tag} (${interaction.user.id})`);
  }
}