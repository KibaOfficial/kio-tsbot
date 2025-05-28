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
 * Leave command for Discord bot.
 * This command allows the bot to leave the user's voice channel.
 * It checks if the user is in a voice channel and if the bot is connected to the same channel.
 * If the bot is connected, it toggles the loop mode for the current song or queue.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the loop command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const loop: Command = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Toggle loop mode for the current song or queue.")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop mode to set")
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Song", value: "song" },
          { name: "Queue", value: "queue" }
        )
        .setRequired(true)
    ),

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

    const mode = interaction.options.get("mode")?.value as string;
    switch (mode) {
      case "off":
        queue.setRepeatMode(0);
        await interaction.reply({
          content: "Loop mode has been turned off.",
          flags: 64,
        });
        break;
      case "song":
        queue.setRepeatMode(1);
        await interaction.reply({
          content: "Loop mode has been set to repeat the current song.",
          flags: 64,
        });
        break;
      case "queue":
        queue.setRepeatMode(2);
        await interaction.reply({
          content: "Loop mode has been set to repeat the entire queue.",
          flags: 64,
        });
        break;
      default:
        await interaction.reply({
          content: "Invalid loop mode specified.",
          flags: 64,
        });
        break;
    }
  }
}