// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, MessageFlags, EmbedBuilder } from "discord.js";
import path from "path";
import fs from "fs";
import { Command } from "../../../interfaces/types";

const itemsPath = path.join(__dirname, "items.json");
const itemsData = JSON.parse(fs.readFileSync(itemsPath, "utf-8"));

export const shop: Command = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("View the items available for purchase in the economy shop."),

  async execute(interaction: CommandInteraction) {
    const items = itemsData['shop-items']?.items || [];
    if (items.length === 0) {
      await interaction.reply({
        content: "The shop is currently empty. Please check back later!",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Fops 🦊 Shop")
      .setDescription("Here are the items available for purchase:")
      .setColor("#FFD700") // Gold color for the shop
      .setFooter({ text: "Use /buy <item_name> to purchase an item." });
    
    items.forEach((item: { name: string; price: number; description: string; }) => {
      embed.addFields({
        name: item.name,
        value: `Price: **${item.price}** fops 🦊\n${item.description}`,
        inline: false
      });
    });

    await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
  }
}