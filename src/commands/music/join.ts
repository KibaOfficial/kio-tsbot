// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";
import { ResponseBuilder } from "../../utils/responses";

/**
 * Join command for Discord bot.
 * This command allows the bot to join the user's voice channel.
 * It checks if the user is in a voice channel and if the bot is already connected to a voice channel.
 * If the bot is not connected, it creates a new queue and connects to the user's voice channel.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the join command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const join: Command = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your voice channel"),
  async execute(interaction) {
    // Check: In Guild?
    if (!(await ensureInGuild(interaction))) return;

    // Check: User in VoiceChannel?
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;    
    const botVoiceChannel = interaction.guild!.members.me?.voice.channel;
    if (botVoiceChannel) {
      if (botVoiceChannel.id === voiceChannel.id) {
        const embed = ResponseBuilder.music(
          "Already Connected",
          "🔊 I am already in your voice channel.\n\nUse `/play` to start playing music!",
          interaction.client
        );
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
        return;
      } else {
        const embed = ResponseBuilder.warning(
          "Different Voice Channel",
          `⚠️ I am already in a different voice channel (**${botVoiceChannel.name}**).\n\nPlease move me to your voice channel or use \`/leave\` first.`,
          interaction.client
        );
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    const player = await getPlayer(interaction.client);

    const queue = player.nodes.create(interaction.guild!, {
      metadata: {
        channel: interaction.channel,
        interaction: interaction,
      },
      selfDeaf: true,
    });

    try {
      await queue.connect(voiceChannel);
      const embed = ResponseBuilder.music(
        "Joined Voice Channel",
        `🔊 **Successfully joined ${voiceChannel.name}!**\n\nUse \`/play\` to start playing music!`,
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error("[Music] Error joining voice channel:", error);
      const embed = ResponseBuilder.error(
        "Join Failed",
        "❌ An error occurred while trying to join the voice channel.\n\nMake sure I have permission to **Join** and **Speak** in that channel.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};