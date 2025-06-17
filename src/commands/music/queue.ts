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
 * Queue command for Discord bot.
 * This command displays the current music queue in the server.
 * It shows the currently playing track and the next tracks in the queue.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the queue command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const queue: Command = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows the current queue of songs"),

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

    const currentTrack = queue.currentTrack;

    const nextTracks = typeof queue.tracks.toArray === "function" ? queue.tracks.toArray() : [];

    const maxDisplay = 10;
    const formattedTracks = [
      `🎶 **Now Playing:** [${currentTrack.title}](${currentTrack.url}) - \`${currentTrack.author}\` [${currentTrack.duration}]`,
      ...nextTracks.slice(0, maxDisplay - 1).map((track, i) =>
        `**${i + 1}.** [${track.title}](${track.url}) - \`${track.author}\` [${track.duration}]`
      ),
    ];

    if (nextTracks.length === 0) {
      formattedTracks.push("_No more songs in the queue._");
    } else if (nextTracks.length > maxDisplay - 1) {
      formattedTracks.push(`...and ${nextTracks.length - (maxDisplay - 1)} more tracks in the queue.`);
    }

    const embed = ResponseBuilder.music(
      "🎵 Music Queue",
      formattedTracks.join("\n"),
      interaction.client
    ).setThumbnail(currentTrack.thumbnail ?? "https://cdn-icons-png.flaticon.com/512/727/727245.png")
     .setFooter({ text: `Total songs in queue: ${1 + nextTracks.length}` })
     .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};