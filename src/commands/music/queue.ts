// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

// queue command for the music system which should reply with the current list of songs with an embed

export const queue: Command = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows the current queue of songs"),

  async execute(interaction: CommandInteraction) {
    // check if the command was sent in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64,
      });
      return;
    }

    // check if the user is in a voice channel
    const member = await interaction.guild.members.fetch(interaction.user.id) as GuildMember;
    if (!member || !member.voice.channel) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: 64,
      });
      return;
    }

    // check if the bot is in a voice channel
    const botVoiceChannel = interaction.guild.members.me?.voice.channel;
    if (!botVoiceChannel) {
      await interaction.reply({
        content: "I am not in a voice channel.",
        flags: 64,
      });
      return;
    }

    // check if the user is in the same voice channel as the bot
    if (member.voice.channel.id !== botVoiceChannel.id) {
      await interaction.reply({
        content: "You need to be in the same voice channel as me to use this command.",
        flags: 64,
      });
      return;
    }

    // get the player for the guild
    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild.id);

    if (!queue || !queue.node.isPlaying() || !queue.currentTrack) {
      await interaction.reply({
        content: "There is no music currently playing in this server.",
        flags: 64,
      });
      return;
    }

    const tracks = [queue.currentTrack, ...(typeof queue.tracks.toArray === "function" ? queue.tracks.toArray() : [])];
    const maxDisplay = 10;
    const formattedTracks = tracks.slice(0, maxDisplay).map((track, index) =>
      index === 0
        ? `🎶 **Now Playing:** [${track.title}](${track.url})`
        : `➤ **#${index}** – [${track.title}](${track.url})`
    );

    if (tracks.length === 1) {
      formattedTracks.push("_No more songs in the queue._");
    } else if (tracks.length > maxDisplay) {
      formattedTracks.push(`\n*...and ${tracks.length - maxDisplay} more song(s).*`);
    }

    const embed = new EmbedBuilder()
      .setColor("#1DB954")
      .setTitle("🎵 Music Queue")
      .setThumbnail(queue.currentTrack.thumbnail ?? "https://cdn-icons-png.flaticon.com/512/727/727245.png")
      .setDescription(formattedTracks.join("\n"))
      .setFooter({ text: `Total songs in queue: ${tracks.length}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  },
};