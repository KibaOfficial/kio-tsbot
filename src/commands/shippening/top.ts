// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { loadData } from "./data";

export const top: Command = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Shows the top 10 most shipped pairs in the server"),
  
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const data = await loadData();
    const pairEntries = Object.entries(data.pairsCount);

    if (pairEntries.length === 0) {
      await interaction.reply("No pairs have been shipped yet.");
      return;
    }

    pairEntries.sort((a, b) => b[1] - a[1]);
    const topPairs = pairEntries.slice(0, 5);

    if (topPairs.length === 0) {
      await interaction.reply("No pairs found in the top list.");
      return;
    }

    let msg = "**Top 5 Shipped Pairs:**\n\n";
    for (const [pairKey, count] of topPairs) {
      const [id1, id2] = pairKey.split('-');
      const member1 = await interaction.guild.members.fetch(id1).catch(() => null);
      const member2 = await interaction.guild.members.fetch(id2).catch(() => null);

      if (member1 && member2) {
        msg += `<@${member1.id}> ❤️ <@${member2.id}> - **${count}**\n`;
      } else {
        msg += `Unknown members in pair: <@${id1}> ❤️ <@${id2}> - **${count}**\n`;
      }
    }
    
    await interaction.reply(msg || "No pairs found in the top list.");
  }
}