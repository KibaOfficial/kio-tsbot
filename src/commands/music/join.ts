// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";

export const join: Command = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your voice channel"),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64,
      });
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id) as GuildMember;
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
    if (botVoiceChannel) {
      if (botVoiceChannel.id === voiceChannel.id) {
        await interaction.reply({
          content: "I am already in your voice channel.",
          flags: 64,
        });
        return;
      } else {
        await interaction.reply({
          content: `I am already in a different voice channel (${botVoiceChannel.name}). Please move me to your voice channel.`,
          flags: 64,
        });
        return;
      }
    }

    const player = await getPlayer(interaction.client);

    const queue = player.nodes.create(interaction.guild, {
      metadata: {
        channel: interaction.channel,
        interaction: interaction,
      },
      selfDeaf: true,
    });

    try {
      await queue.connect(voiceChannel);
      await interaction.reply({
        content: `✅ Joined ${voiceChannel.name}.`,
      });
    } catch (error) {
      console.error("[Music] Error joining voice channel:", error);
      await interaction.reply({
        content: "An error occurred while trying to join the voice channel. Make sure I have permission to join and speak in that channel.",
        flags: 64,
      });
    }
  }
};