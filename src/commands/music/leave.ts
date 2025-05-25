// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

export const leave: Command = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the voice channel"),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64,
      });
      return;
    }

    const botVoiceChannel = interaction.guild.members.me?.voice.channel;
    if (!botVoiceChannel) {
      await interaction.reply({
        content: "I am not in a voice channel.",
        flags: 64,
      });
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member) {
      await interaction.reply({
        content: "You need to be a member of this server to use this command.",
        flags: 64,
      });
      return;
    }

    const userVoiceChannel = member.voice.channel;
    if (!userVoiceChannel) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: 64,
      });
      return;
    }

    if (userVoiceChannel.id !== botVoiceChannel.id) {
      await interaction.reply({
        content: "You need to be in the same voice channel as me to use this command.",
        flags: 64,
      });
      return;
    }

    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild.id);

    try {
      if (queue) {
        queue.delete();
      } else {
        await interaction.guild.members.me?.voice.disconnect();
      }
      await interaction.reply({
        content: "✅ I have left the voice channel.",
        flags: 64,
      });
    } catch (error) {
      console.error("Error leaving voice channel:", error);
      await interaction.reply({
        content: "❌ An error occurred while trying to leave the voice channel.",
        flags: 64,
      });
    }
  }
};