// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer, queueLimit } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";

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
        flags: 64,
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
          flags: 64,
        });
        return;
      }

      const tracksToAdd = result.playlist ? result.tracks : [result.tracks[0]];
      const totalQueued = queue.tracks.size + tracksToAdd.length;
      if (totalQueued > queueLimit) {
        await interaction.reply({
          content: `The queue limit is ${queueLimit} songs. You cannot add more songs.`,
          flags: 64,
        });
        return;
      }

      if (result.playlist) {
        queue.addTrack(result.tracks.slice(0, queueLimit - queue.tracks.size));
      } else {
        queue.addTrack(result.tracks[0]);
      }

      if (!queue.node.isPlaying()) await queue.node.play();

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
      if (result.playlist) {
        embed
          .setTitle(`Playlist added to queue: ${result.playlist.title}`)
          .setDescription(`[${result.playlist.title}](${result.playlist.url})`)
          .addFields(
            { name: "Tracks", value: `${tracksToAdd.length}`, inline: true },
            { name: "Author", value: result.playlist.author?.name || "Unknown", inline: true }
          )
          .setThumbnail(result.playlist.thumbnail || result.tracks[0]?.thumbnail || null)
          .addFields({
            name: "First 5 tracks",
            value: result.tracks.slice(0, 5).map(t => `[${t.title}](${t.url})`).join("\n"),
            inline: false,
          });
      } else {
        const track = result.tracks[0];
        embed
          .setTitle("Track added to queue")
          .setDescription(`[${track.title}](${track.url})`)
          .addFields(
            { name: "Duration", value: track.duration, inline: true },
            { name: "Author", value: track.author, inline: true }
          )
          .setThumbnail(track.thumbnail || null);
      }

      // log the used extractor
      console.log(`[Music] Extractor used: ${result.extractor!.identifier || "Unknown"}`);
      await interaction.editReply({ embeds: [embed] });
      console.log(`[Music] ${interaction.user.tag} added ${result.playlist ? `${tracksToAdd.length} songs from playlist` : `1 song`} to the queue in ${interaction.guild!.name}`);
    } catch (error) {
      console.error(`[Music] Error playing song:`, error);
      await interaction.reply({
        content: "An error occurred while trying to play the song.",
        flags: 64,
      });
    }
  },
};