// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";
import { ResponseBuilder } from "../../utils/responses";

/**
 * Now Playing command for Discord bot.
 * This command shows the currently playing song in the voice channel.
 * It checks if the user is in a voice channel and if the bot is connected to the same channel.
 * If a song is currently playing, it displays the song information in an embed.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the nowplaying command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const nowplaying: Command = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Shows the currently playing song"),

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
        "No Song Playing",
        "There is no song currently playing.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // create an embed with the current song information
    const currentTrack = queue.currentTrack;
    const embed = ResponseBuilder.music(
      "Now Playing",
      `**[${currentTrack.title}](${currentTrack.url})**\n` +
      `**Artist:** ${currentTrack.author}\n` +
      `**Duration:** ${currentTrack.duration}`,
      interaction.client
    );
    
    embed.setThumbnail(currentTrack.thumbnail ?? "https://cdn-icons-png.flaticon.com/512/727/727245.png");
    
    if (currentTrack.requestedBy) {
      embed.setFooter({
        text: `Requested by ${currentTrack.requestedBy.username}`,
        iconURL: currentTrack.requestedBy.displayAvatarURL?.() ?? undefined
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
};