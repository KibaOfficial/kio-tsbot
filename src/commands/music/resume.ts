// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

// resume command for the music system

export const resume: Command = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused song."),

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64 // Ephemeral
      });
      return;
    }

    const member = (await interaction.guild.members.fetch(
      interaction.user.id) as GuildMember);

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: 64 // Ephemeral
      });
      return;
    }

    const botVoiceChannel = interaction.guild.members.me?.voice.channel;
    if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
      await interaction.reply({
        content: `I am already in a different voice channel (${botVoiceChannel.name}). Please move me to your voice channel.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild.id);

    if (!queue || !queue.node.isPlaying()) {
      await interaction.reply({
        content: "There's no music playing right now.",
        flags: 64
      });
      return;
    }

    if (!queue.node.isPaused()) {
      await interaction.reply({
        content: "The music is already playing.",
        flags: 64
      });
      return;
    }

    queue.node.setPaused(false);
    await interaction.reply({
      content: "▶️ The music has been resumed.",
      flags: 64
    });
  }
}