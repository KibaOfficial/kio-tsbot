// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder, } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";

/**
 * Resume command for Discord bot.
 * This command resumes the paused song in the voice channel.
 * It checks if the user is in a voice channel and if the bot is connected to the same channel.
 * If the music is already playing, it informs the user; otherwise, it resumes the music.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the resume command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const resume: Command = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused song."),

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
      await interaction.reply({
        content: "There's no music playing right now.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!queue.node.isPaused()) {
      await interaction.reply({
        content: "The music is already playing.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }


    queue.node.setPaused(false);
    await interaction.reply({
      content: "▶️ The music has been resumed.",
      flags: MessageFlags.Ephemeral
    });
  }
}