// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { CommandInteraction, GuildMember, MessageFlags, VoiceChannel, ChannelType } from "discord.js";


// Utility functions for voice channel management

export async function ensureInGuild(interaction: CommandInteraction) {
  // Check if the command is used in a guild
  if (!interaction.guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: 64, // Ephemeral message
    });
    return false;
  }
  return true;
}

export async function ensureInVoice(interaction: CommandInteraction): Promise<VoiceChannel | false> {
  const member = await interaction.guild?.members.fetch(interaction.user.id) as GuildMember;
  if (!member) {
    await interaction.reply({
      content: "You need to be a member of this server to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  const voiceChannel = member.voice.channel;
  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await interaction.reply({
      content: "You need to be in a **voice channel** (not a stage channel) to use this command.",
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  return voiceChannel as VoiceChannel;
}

export async function ensureBotInSameVoice(interaction: CommandInteraction, userVoiceChannel: VoiceChannel): Promise<boolean> {
  const botVoiceChannel = interaction.guild?.members.me?.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== userVoiceChannel.id) {
    await interaction.reply({
      content: `I am already in a different voice channel (${botVoiceChannel.name}). Please move me to your voice channel.`,
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  return true;
}