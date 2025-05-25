// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer, queueLimit } from "../../music/player";

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

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64,
      });
      return;
    }

    const member = (await interaction.guild.members.fetch(
      interaction.user.id
    )) as GuildMember;
    if (!member) {
      await interaction.reply({
        content: "You need to be a member of this server to use this command.",
        flags: 64,
      });
      return;
    }
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: 64,
      });
      return;
    }

    const botVoiceChannel = interaction.guild.members.me?.voice.channel;
    if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
      await interaction.reply({
        content: `I am already in a different voice channel (${botVoiceChannel.name}). Please move me to your voice channel.`,
        flags: 64,
      });
      return;
    }
    // Wenn Bot noch nicht connected oder im gleichen Channel: weitermachen!

    const query = interaction.options.get("song")?.value as string;
    const player = await getPlayer(interaction.client);

    const queue = player.nodes.create(interaction.guild, {
      metadata: {
        channel: interaction.channel,
        interaction: interaction,
      },
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

      await interaction.reply({ embeds: [embed] });
      console.log(`[Music] ${interaction.user.tag} added ${result.playlist ? `${tracksToAdd.length} songs from playlist` : `1 song`} to the queue in ${interaction.guild.name}`);
    } catch (error) {
      console.error(`[Music] Error playing song:`, error);
      await interaction.reply({
        content: "An error occurred while trying to play the song.",
        flags: 64,
      });
    }
  },
};