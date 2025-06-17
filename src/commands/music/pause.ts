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
 * Pause command for Discord bot.
 * This command pauses the currently playing song in the voice channel.
 * It checks if the user is in a voice channel and if the bot is connected to the same channel.
 * If the music is already paused, it informs the user; otherwise, it pauses the music.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the pause command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const pause: Command = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song."),

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

    if (!queue || !queue.currentTrack) {
      const embed = ResponseBuilder.music(
        "❌ No Music Playing", 
        "There's no music playing right now.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (queue.node.isPaused()) {
      const embed = ResponseBuilder.music(
        "⏸️ Already Paused", 
        "The music is already paused.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    queue.node.setPaused(true);
    const embed = ResponseBuilder.music(
      "⏸️ Music Paused", 
      "The music has been paused.",
      interaction.client
    );
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });

  }
}