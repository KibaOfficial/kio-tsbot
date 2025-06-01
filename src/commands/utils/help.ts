// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {
  SlashCommandBuilder,
  EmbedBuilder,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder
} from "discord.js";
import { Command } from "../../interfaces/types";
import { formatCommandsDescription } from "../../utils/utils";

const categoryEmojis: Record<string, string> = {
  economy: "💰",
  moderation: "🛡️",
  music: "🎵",
  reactionroles: "🎭",
  shippening: "🚢",
  utils: "🛠️",
  welcome: "👋",
  misc: "✨"
};

export const help: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows information about all available bot commands"),

  async execute(interaction) {
    try {
      const client = interaction.client as Client & {
        commands?: Map<string, Command & { category: string }>
      };

      if (!client.commands) {
        await interaction.reply({
          content: "The command list is currently unavailable. Please try again later.",
          flags: 64 // Ephemeral
        });
        return;
      }

      const commandArr = Array.from(client.commands.values())
        .filter(cmd => cmd.data.name && !cmd.data.name.startsWith("dev-"));
      const grouped: Record<string, typeof commandArr> = {};
      for (const cmd of commandArr) {
        const cat = (cmd.category || "misc").toLowerCase();
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(cmd);
      }
      const categories = Object.keys(grouped);

      // Build main embed
      let preview = '';
      for (const cat of categories) {
        // Show only the category name and emoji, optionally a short description if you want
        preview += `${categoryEmojis[cat] || "✨"} **${cat[0].toUpperCase()}${cat.slice(1)}**\n`;
      }
      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`✨ Help - Command Categories`)
        .setDescription(
          `Select a category below to view all available commands.\n\n${preview}`
        )
        .setFooter({ text: `Use the dropdown to browse command categories.` })
        .setTimestamp()
        .setThumbnail(interaction.client.user?.displayAvatarURL() || "");

      // Build dropdown menu with emojis
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("help_category_select")
        .setPlaceholder("Select a category...")
        .addOptions(categories.map(cat => ({
          label: `${cat[0].toUpperCase()}${cat.slice(1)}`,
          value: cat,
          emoji: categoryEmojis[cat] || "✨"
        })));
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: false
      });
    } catch (error) {
      console.error("[Main] Error in help command:", error);
      await interaction.reply({
        content: "An error occurred while trying to display the help menu.",
        flags: 64 // Ephemeral
      });
    }
  }
};