// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer, queueLimit } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";
import { ResponseBuilder } from "../../utils/responses";

export const play: Command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in the voice channel")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The name or URL of the song to play")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    // Check: In Guild?
    if (!(await ensureInGuild(interaction))) return;

    // Check: User in VoiceChannel?
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;

    // Check: Bot in same Channel or not connected?
    if (!(await ensureBotInSameVoice(interaction, voiceChannel))) return;

    const query = interaction.options.get("song", true).value as string;
    const player = await getPlayer(interaction.client);
    if (!player) {
      await interaction.reply({
        content: "Music player is not initialized. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const queue = player.nodes.create(interaction.guild!, {
      metadata: {
        channel: interaction.channel,
        voiceChannel: voiceChannel,
      },
      volume: 100,
      leaveOnEmpty: false,
      leaveOnEnd: false,
      leaveOnStop: false,
      selfDeaf: true,
    });

    try {
      if (!queue.connection) await queue.connect(voiceChannel);

      const result = await player.search(query, {
        requestedBy: interaction.user,
      });

      if (!result || !result.tracks.length) {
        await interaction.reply({
          content: "No results found for your query.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const tracksToAdd = result.playlist ? result.tracks : [result.tracks[0]];
      const totalQueued = queue.tracks.size + tracksToAdd.length;
      if (totalQueued > queueLimit) {
        await interaction.reply({
          content: `The queue limit is ${queueLimit} songs. You cannot add more songs.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (result.playlist) {
        queue.addTrack(result.tracks.slice(0, queueLimit - queue.tracks.size));
      } else {
        queue.addTrack(result.tracks[0]);
      }

      if (!queue.node.isPlaying()) await queue.node.play();

      let embed;
      if (result.playlist) {
        embed = ResponseBuilder.music(
          `Playlist added to queue: ${result.playlist.title}`,
          `[${result.playlist.title}](${result.playlist.url})\n\n` +
          `**Tracks:** ${tracksToAdd.length}\n` +
          `**Author:** ${result.playlist.author?.name || "Unknown"}\n` +
          `**First 5 tracks:**\n${result.tracks.slice(0, 5).map(t => `[${t.title}](${t.url})`).join("\n")}\n\n` +
          `*Requested by ${interaction.user.username}*`,
          interaction.client
        );
        if (result.playlist.thumbnail || result.tracks[0]?.thumbnail) {
          embed.setThumbnail(result.playlist.thumbnail || result.tracks[0]?.thumbnail || null);
        }
      } else {
        const track = result.tracks[0];
        embed = ResponseBuilder.music(
          "Track added to queue",
          `[${track.title}](${track.url})\n\n` +
          `**Duration:** ${track.duration}\n` +
          `**Author:** ${track.author}\n\n` +
          `*Requested by ${interaction.user.username}*`,
          interaction.client
        );
        if (track.thumbnail) {
          embed.setThumbnail(track.thumbnail);
        }
      }

      // log the used extractor
      console.log(`[Music] Extractor used: ${result.extractor!.identifier || "Unknown"}`);
      await interaction.editReply({ embeds: [embed] });
      console.log(`[Music] ${interaction.user.tag} added ${result.playlist ? `${tracksToAdd.length} songs from playlist` : `1 song`} to the queue in ${interaction.guild!.name}`);
    } catch (error) {
      console.error(`[Music] Error playing song:`, error);
      await interaction.reply({
        content: "An error occurred while trying to play the song.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};