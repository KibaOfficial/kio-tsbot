// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {
  SlashCommandBuilder,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  MessageFlags
} from "discord.js";
import { Command } from "../../interfaces/types";
import { ResponseBuilder } from "../../utils/responses";

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
      };      if (!client.commands) {
        const embed = ResponseBuilder.error(
          "Command List Unavailable",
          "The command list is currently unavailable. Please try again later.",
          interaction.client
        );
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral // Ephemeral
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
      const embed = ResponseBuilder.info(
        "✨ Help - Command Categories",
        `Select a category below to view all available commands.\n\n${preview}\n\nUse the dropdown to browse command categories.`,
        interaction.client
      );

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
        flags: MessageFlags.Ephemeral // Ephemeral
      });    } catch (error) {
      console.error("[Main] Error in help command:", error);
      const embed = ResponseBuilder.commandError("help", interaction.client);
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral // Ephemeral
      });
    }
  }
};