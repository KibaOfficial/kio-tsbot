// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { getPlayer } from "../../music/player";
import { ensureBotInSameVoice, ensureInGuild, ensureInVoice } from "../../utils/voiceUtils";

// skip command for the music system

export const skip: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song"),

  async execute(interaction: CommandInteraction) {
    // Is it a guild command?
    if (!(await ensureInGuild(interaction))) return;

    // Is the user in a voice channel? (and return the voice channel)
    const voiceChannel = await ensureInVoice(interaction);
    if (!voiceChannel) return;

    // Is the bot in the same voice channel or not even connected to a voice channel?
    if (!(await ensureBotInSameVoice(interaction, voiceChannel))) return;

    // get the player for the guild
    const player = await getPlayer(interaction.client);
    const queue = player.nodes.get(interaction.guild!.id);

    if (!queue) {
      await interaction.reply({
        content: "There is no music playing in this server.",
        flags: 64,
      });
      return;
    }

    // check if there is a song to skip
    if (!queue.node.isPlaying()) {
      await interaction.reply({
        content: "There is no song to skip.",
        flags: 64,
      });
      return;
    }

    // skip the current song
    const skipped = queue.node.skip();

    if (skipped) {
      let content = "✅ Skipped the current song.";

      // wait for the next track to be ready
      await new Promise(res => setTimeout(res, 200));
      const currentTrack = queue.currentTrack;

      if (currentTrack) {
        content += `\n🎶 **Now playing:** [${currentTrack.title}](${currentTrack.url}) - \`${currentTrack.author}\` [${currentTrack.duration}]`;
      } else {
        content += `\nEs gibt keinen weiteren Song in der Queue.`;
      }

      await interaction.reply({ content });
    } else {
      // if skip should fail (which is unlikely)
      await interaction.reply({
        content: "❌ Unable to skip the current song. Please try again later.",
        flags: 64,
      });
    }
  }
}