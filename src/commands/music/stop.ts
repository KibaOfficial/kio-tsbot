// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

// stop command for the music system

export const stop: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the current song, clears the queue and leaves the voice channel"),

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

    // check if there is a queue
    if (!queue) {
      await interaction.reply({
        content: "There is no music playing in this server.",
        flags: 64,
      });
      return;
    }

    // check if the player is playing
    if (!queue.node.isPlaying()) {
      await interaction.reply({
        content: "There is no music currently playing.",
        flags: 64,
      });
      return;
    }

    // stop the player and clear the queue
    try {
      queue.node.stop();
      await interaction.reply({
        content: "✅ Stopped the music, cleared the queue and left the voice channel.",
        flags: 64,
      });
    } catch (error) {
      console.error("Error stopping music:", error);
      await interaction.reply({
        content: "An error occurred while trying to stop the music.",
        flags: 64,
      });
    }
  }
}