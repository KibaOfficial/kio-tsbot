// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

// skip command for the music system

export const skip: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song"),

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

    if (!queue) {
      await interaction.reply({
        content: "There is no music playing in this server.",
        flags: 64,
      });
      return;
    }

    // check if there is a song to skip
    if (!queue.node.isPlaying()) {
      await interaction.reply({
        content: "There is no song to skip.",
        flags: 64,
      });
      return;
    }

    // skip the current song
    const skipped = queue.node.skip();

    if (skipped) {
      await interaction.reply({
        content: "✅ Skipped the current song.",
      });
    } else {
      await interaction.reply({
        content: "❌ Failed to skip the current song.",
        flags: 64,
      });
    }
  }
}