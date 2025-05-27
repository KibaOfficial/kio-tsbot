// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInGuild, ensureInVoice } from "../../utils/voiceUtils";

// pause command for the music system

export const pause: Command = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song."),

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

    if (!queue || !queue.currentTrack) {
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