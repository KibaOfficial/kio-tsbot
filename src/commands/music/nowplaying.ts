// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

export const nowplaying: Command = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Shows the currently playing song"),

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
    const member = await interaction.guild.members.fetch(interaction.user.id);
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
        content: "There is no song currently playing.",
        flags: 64,
      });
      return;
    }

    // create an embed with the current song information
    const currentTrack = queue.currentTrack;
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Now Playing")
      .setDescription(
        `**[${currentTrack.title}](${currentTrack.url})**\n` +
        `**Artist:** ${currentTrack.author}\n` +
        `**Duration:** ${currentTrack.duration}`
      )
      .setThumbnail(currentTrack.thumbnail ?? "https://cdn-icons-png.flaticon.com/512/727/727245.png")
      .setFooter({
        text: `Requested by ${currentTrack.requestedBy ? currentTrack.requestedBy.username : "Unknown"}`,
        iconURL: currentTrack.requestedBy?.displayAvatarURL?.() ?? undefined
      });

    await interaction.reply({ embeds: [embed] });
  }
};