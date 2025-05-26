// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

// pause command for the music system

export const pause: Command = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song."),

  async execute(interaction: CommandInteraction) {
    // check if the command is used in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64 // Ephemeral
      });
      return;
    }

    const member = (await interaction.guild.members.fetch(
      interaction.user.id) as GuildMember);

    // check if the user is in a voice channel
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: 64 // Ephemeral
      });
      return;
    }

    // check if the bot is in the same voice channel
    const botVoiceChannel = interaction.guild.members.me?.voice.channel;
    if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
      await interaction.reply({
        content: `I am already in a different voice channel (${botVoiceChannel.name}). Please move me to your voice channel.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    // get the player for the guild
    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild.id);

    if (!queue || !queue.node.isPlaying()) {
      await interaction.reply({
        content: "There's no music playing right now.",
        flags: 64
      });
      return;
    }

    if (queue.node.isPaused()) {
      await interaction.reply({
        content: "The music is already paused.",
        flags: 64
      });
      return;
    }

    queue.node.setPaused(true);
    await interaction.reply({
      content: "⏸️ The music has been paused.",
      flags: 64
    });
  }
}