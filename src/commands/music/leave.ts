// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInVoice } from "../../utils/voiceUtils";
import { ensureInGuild } from "../../utils/utils";
import { ResponseBuilder } from "../../utils/responses";

/**
 * Leave command for Discord bot.
 * This command allows the bot to leave the user's voice channel.
 * It checks if the user is in a voice channel and if the bot is connected to the same channel.
 * If the bot is connected, it deletes the queue or disconnects from the voice channel.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the leave command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 * @description This command is used to make the bot leave the voice channel it is currently in.
 */
export const leave: Command = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the voice channel"),
  async execute(interaction) {
    // Check: In Guild?
    if (!(await ensureInGuild(interaction))) return;

    // Check: User in VoiceChannel?
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;

    // Check: Bot in same Channel or not connected?
    if (!(await ensureBotInSameVoice(interaction, voiceChannel))) return;

    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild!.id);    try {
      if (queue) {
        queue.delete();
      } else {
        await interaction.guild!.members.me?.voice.disconnect();
      }
      const embed = ResponseBuilder.music(
        "Left Voice Channel",
        "👋 **Successfully left the voice channel.**\n\nMusic has been stopped and queue cleared.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error leaving voice channel:", error);
      const embed = ResponseBuilder.error(
        "Leave Failed",
        "❌ An error occurred while trying to leave the voice channel.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};