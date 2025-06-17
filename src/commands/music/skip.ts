// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, MessageFlags } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";
import { ResponseBuilder } from "../../utils/responses";

/**
 * Skip command for Discord bot.
 * This command skips the currently playing song in the voice channel.
 * It checks if the user is in a voice channel and if the bot is connected to the same channel.
 * If there is a song to skip, it skips it and provides feedback to the user.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the skip command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const skip: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song"),

  async execute(interaction) {
    // Is it a guild command?
    if (!(await ensureInGuild(interaction))) return;

    // Is the user in a voice channel? (and return the voice channel)
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;

    // Is the bot in the same voice channel or not even connected to a voice channel?
    if (!(await ensureBotInSameVoice(interaction, voiceChannel))) return;

    // get the player for the guild
    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild!.id);

    if (!queue) {
      const embed = ResponseBuilder.music(
        "No Music Playing",
        "🔇 There is no music playing in this server.\n\nUse `/play` to start playing music!",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // check if there is a song to skip
    if (!queue.node.isPlaying()) {
      const embed = ResponseBuilder.music(
        "Nothing to Skip",
        "⏸️ There is no song to skip.\n\nThe queue is currently empty or paused.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // skip the current song
    const skipped = queue.node.skip();

    if (skipped) {
      // wait for the next track to be ready
      await new Promise(res => setTimeout(res, 200));
      const currentTrack = queue.currentTrack;

      let description = "⏭️ **Skipped the current song.**";
      
      if (currentTrack) {
        // log the used extractor
        console.log(`[Music] Extractor used: ${currentTrack.extractor!.identifier || "Unknown"}`);
        description += `\n\n🎶 **Now playing:** [${currentTrack.title}](${currentTrack.url}) - \`${currentTrack.author}\` [${currentTrack.duration}]`;
      } else {
        description += `\n\n🔇 No more songs in the queue.`;
      }

      const embed = ResponseBuilder.music(
        "Song Skipped",
        description,
        interaction.client
      );
      
      await interaction.reply({ embeds: [embed] });
    } else {
      // if skip should fail (which is unlikely)
      const embed = ResponseBuilder.error(
        "Skip Failed",
        "❌ Unable to skip the current song. Please try again later.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}