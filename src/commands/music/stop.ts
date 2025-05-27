// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInGuild, ensureInVoice } from "../../utils/voiceUtils";

// stop command for the music system

export const stop: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the current song, clears the queue and leaves the voice channel"),

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

    // check if there is a queue
    if (!queue) {
      await interaction.reply({
        content: "There is no music playing in this server.",
        flags: 64,
      });
      return;
    }

    // check if the player is playing
    if (!queue.node.isPlaying()) {
      await interaction.reply({
        content: "There is no music currently playing.",
        flags: 64,
      });
      return;
    }

    // stop the player and clear the queue
    try {
      queue.node.stop();
      await interaction.reply({
        content: "✅ Stopped the music, cleared the queue and left the voice channel.",
        flags: 64,
      });
    } catch (error) {
      console.error("Error stopping music:", error);
      await interaction.reply({
        content: "An error occurred while trying to stop the music.",
        flags: 64,
      });
    }
  }
}