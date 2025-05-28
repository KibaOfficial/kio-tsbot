// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";

/**
 * Join command for Discord bot.
 * This command allows the bot to join the user's voice channel.
 * It checks if the user is in a voice channel and if the bot is already connected to a voice channel.
 * If the bot is not connected, it creates a new queue and connects to the user's voice channel.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the join command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const join: Command = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your voice channel"),
  async execute(interaction) {
    // Check: In Guild?
    if (!(await ensureInGuild(interaction))) return;

    // Check: User in VoiceChannel?
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;

    const botVoiceChannel = interaction.guild!.members.me?.voice.channel;
    if (botVoiceChannel) {
      if (botVoiceChannel.id === voiceChannel.id) {
        await interaction.reply({
          content: "I am already in your voice channel.",
          flags: 64,
        });
        return;
      } else {
        await interaction.reply({
          content: `I am already in a different voice channel (${botVoiceChannel.name}). Please move me to your voice channel.`,
          flags: 64,
        });
        return;
      }
    }

    const player = await getPlayer(interaction.client);

    const queue = player.nodes.create(interaction.guild!, {
      metadata: {
        channel: interaction.channel,
        interaction: interaction,
      },
      selfDeaf: true,
    });

    try {
      await queue.connect(voiceChannel);
      await interaction.reply({
        content: `✅ Joined ${voiceChannel.name}.`,
      });
    } catch (error) {
      console.error("[Music] Error joining voice channel:", error);
      await interaction.reply({
        content: "An error occurred while trying to join the voice channel. Make sure I have permission to join and speak in that channel.",
        flags: 64,
      });
    }
  }
};