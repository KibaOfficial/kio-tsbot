// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInGuild, ensureInVoice } from "../../utils/voiceUtils";

export const leave: Command = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the voice channel"),
  async execute(interaction: CommandInteraction) {
    // Check: In Guild?
    if (!(await ensureInGuild(interaction))) return;

    // Check: User in VoiceChannel?
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;

    // Check: Bot in same Channel or not connected?
    if (!(await ensureBotInSameVoice(interaction, voiceChannel))) return;

    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild!.id);

    try {
      if (queue) {
        queue.delete();
      } else {
        await interaction.guild!.members.me?.voice.disconnect();
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