// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";

/**
 * Clearqueue command for Discord bot.
 * This command clears the current music queue in the server.
 * It checks if the user is in a voice channel and if the bot is in the same channel before clearing the queue.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the clearqueue command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const clearqueue: Command = {
  data: new SlashCommandBuilder()
    .setName("clearqueue")
    .setDescription("Clears the current music queue."),

  async execute(interaction) {
    // Check: In Guild?
    if (!(await ensureInGuild(interaction))) return;

    // Check: User in VoiceChannel?
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;

    // Check: Bot in same Channel or not connected?
    if (!(await ensureBotInSameVoice(interaction, voiceChannel))) return;

    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild!.id);

    if (!queue || !queue.node.isPlaying() || !queue.currentTrack) {
      await interaction.reply({
        content: "There is no music currently playing in this server.",
        flags: 64,
      });
      return;
    }

    try {
      queue.tracks.clear();
      await interaction.reply({
        content: "✅ The music queue has been cleared.",
        flags: 64,
      });
    } catch (error) {
      console.error("[Music] Error clearing music queue:", error);
      await interaction.reply({
        content: "❌ An error occurred while clearing the music queue.",
        flags: 64,
      });
    }
  }
}