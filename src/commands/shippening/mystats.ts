// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { loadData } from "./data";

export const mystats: Command = {
  data: new SlashCommandBuilder()
    .setName("mystats")
    .setDescription("Shows your shipping statistics"),

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const userId = interaction.user.id;
    const data = await loadData();

    let count = 0;

    for (const pairKey in data.pairsCount) {
      if (pairKey.includes(userId)) {
        count += data.pairsCount[pairKey];
      }
    }

    await interaction.reply({
      content: `**Your Shipping Statistics:**\n\nYou have been shipped **${count}** times in this server.`,
      // ephemeral: true
    })

  }
}