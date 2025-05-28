// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { GuildMember, VoiceChannel, ChannelType, ChatInputCommandInteraction } from "discord.js";


// Utility functions for voice channel management


/**
 * Ensures the user is in a voice channel.
 * If the user is not in a voice channel, it replies with an error message.
 * @param interaction - The command interaction from Discord.
 * @returns - The voice channel the user is in, or false if the user is not in a voice channel.
 * @throws - If the user is not a member of the guild.
 */
export async function ensureInVoice(interaction: ChatInputCommandInteraction): Promise<VoiceChannel | false> {
  const member = await interaction.guild?.members.fetch(interaction.user.id) as GuildMember;
  if (!member) {
    await interaction.reply({
      content: "You need to be a member of this server to use this command.",
      flags: 64 // Ephemeral
    });
    return false;
  }
  const voiceChannel = member.voice.channel;
  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    await interaction.reply({
      content: "You need to be in a **voice channel** (not a stage channel) to use this command.",
      flags: 64 // Ephemeral
    });
    return false;
  }
  return voiceChannel as VoiceChannel;
}


/**
 * Ensures the bot is in the same voice channel as the user.
 * If the bot is already in a different voice channel, it replies with an error message.
 * @param interaction - The command interaction from Discord as ChatInputCommandInteraction.
 * @param userVoiceChannel - The voice channel the user is currently in as VoiceChannel.
 * @returns - A boolean indicating whether the bot is in the same voice channel as the user.
 * @throws - If the bot is not in the same voice channel as the user.
 */
export async function ensureBotInSameVoice(interaction: ChatInputCommandInteraction, userVoiceChannel: VoiceChannel): Promise<boolean> {
  const botVoiceChannel = interaction.guild?.members.me?.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== userVoiceChannel.id) {
    await interaction.reply({
      content: `I am already in a different voice channel (${botVoiceChannel.name}). Please move me to your voice channel.`,
      flags: 64 // Ephemeral
    });
    return false;
  }
  return true;
}