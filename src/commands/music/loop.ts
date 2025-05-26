// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

export const loop: Command = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Toggle loop mode for the current song or queue.")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop mode to set")
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Song", value: "song" },
          { name: "Queue", value: "queue" }
        )
        .setRequired(true)
    ),

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

    const mode = interaction.options.get("mode")?.value as string;
    switch (mode) {
      case "off":
        queue.setRepeatMode(0);
        await interaction.reply({
          content: "Loop mode has been turned off.",
          flags: 64,
        });
        break;
      case "song":
        queue.setRepeatMode(1);
        await interaction.reply({
          content: "Loop mode has been set to repeat the current song.",
          flags: 64,
        });
        break;
      case "queue":
        queue.setRepeatMode(2);
        await interaction.reply({
          content: "Loop mode has been set to repeat the entire queue.",
          flags: 64,
        });
        break;
      default:
        await interaction.reply({
          content: "Invalid loop mode specified.",
          flags: 64,
        });
        break;
    }
  }
}