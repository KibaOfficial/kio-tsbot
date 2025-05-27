// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, Client } from "discord.js";
import { Command } from "../../interfaces/types";

// help command for the main system

export const help: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Provides information about the available commands"),

  async execute(interaction: CommandInteraction) {
    try {
      const client = interaction.client as Client & {
        commands?: Map<string, Command & { category: string }>
      };

      if (!client.commands) {
        await interaction.reply({
          content: "Command list is currently unavailable. Please try again later.",
          flags: 64 // Ephemeral
        });
        return;
      }

      const commandArr = Array.from(client.commands.values())
        .filter(cmd => cmd.data.name && !cmd.data.name.startsWith("dev-"));

      const grouped: Record<string, typeof commandArr> = {};
      for (const cmd of commandArr) {
        const cat = cmd.category || "misc";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(cmd);
      }

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("📖 Available Commands")
        .setDescription(
          "Here are all the available commands, grouped by category.\n\nUse `/command` to execute."
        )
        .setFooter({ text: `Use /<command> to execute | ${commandArr.length} commands` });

      for (const [cat, cmds] of Object.entries(grouped)) {
        embed.addFields({
          name: `\u200B\n__📂 ${cat[0].toUpperCase()}${cat.slice(1)}__`,
          value: cmds
            .map(cmd => `• \`/${cmd.data.name}\`: ${cmd.data.description || "*No description available*"}`)
            .join("\n"),
          inline: false
        });
      }
      embed.setTimestamp();
      embed.setThumbnail(interaction.client.user?.displayAvatarURL() || "");
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("[Main] Error in help command:", error);
      await interaction.reply({
        content: "An error occurred while trying to fetch the help information.",
        flags: 64 // Ephemeral
      });
    }
  }
}