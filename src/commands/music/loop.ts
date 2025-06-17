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
      const embed = ResponseBuilder.music(
        "❌ No Music Playing", 
        "There is no music currently playing in this server.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const mode = interaction.options.get("mode")?.value as string;
    switch (mode) {
      case "off":
        queue.setRepeatMode(0);
        const offEmbed = ResponseBuilder.music(
          "🔁 Loop Mode Off", 
          "Loop mode has been turned off.",
          interaction.client
        );
        await interaction.reply({
          embeds: [offEmbed],
          flags: MessageFlags.Ephemeral,
        });
        break;
      case "song":
        queue.setRepeatMode(1);
        const songEmbed = ResponseBuilder.music(
          "🔂 Song Loop", 
          "Loop mode has been set to repeat the current song.",
          interaction.client
        );
        await interaction.reply({
          embeds: [songEmbed],
          flags: MessageFlags.Ephemeral,
        });
        break;
      case "queue":
        queue.setRepeatMode(2);
        const queueEmbed = ResponseBuilder.music(
          "🔁 Queue Loop", 
          "Loop mode has been set to repeat the entire queue.",
          interaction.client
        );
        await interaction.reply({
          embeds: [queueEmbed],
          flags: MessageFlags.Ephemeral,
        });
        break;
      default:
        const errorEmbed = ResponseBuilder.error(
          "Invalid Loop Mode", 
          "Invalid loop mode specified.",
          interaction.client
        );
        await interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
        break;
    }
  }
}