// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";
import { ResponseBuilder } from "../../utils/responses";

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
    const queue = player.nodes.get(interaction.guild!.id);    if (!queue || !queue.node.isPlaying() || !queue.currentTrack) {
      const embed = ResponseBuilder.music(
        "No Music Playing",
        "🔇 There is no music currently playing in this server.\n\nUse `/play` to start playing music!",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      queue.tracks.clear();
      const embed = ResponseBuilder.music(
        "Queue Cleared",
        "🗑️ **The music queue has been cleared.**\n\nThe currently playing song will continue, but no more songs are queued.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("[Music] Error clearing music queue:", error);
      const embed = ResponseBuilder.error(
        "Clear Failed",
        "❌ An error occurred while clearing the music queue.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}