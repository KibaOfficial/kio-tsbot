// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { getUserData } from "./data";

export const inventory: Command = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Check your inventory in the economy system."),

  execute: async (interaction) => {
    const userId = interaction.user.id;

    // fetch userData from the economy data
    const userData = await getUserData(userId);

    // Check if the user has any items in their inventory
    if (!userData.inventory || userData.inventory.length === 0) {
      await interaction.reply({
        content: "Your inventory is empty. You can buy items from the shop using `/shop` command.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // Create a formatted string for the inventory items
    const inventoryItems = userData.inventory
      .map(item => `${item.emoji} **${item.name}** - ${item.quantity || 1} (${item.desc})`)
      .join("\n");

    // Create an embed to display the inventory
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Your Inventory")
      .setDescription(`You have the following items in your inventory:\n\n${inventoryItems}`)
      .setFooter({ text: "Use /shop to buy more items." });
    await interaction.reply({ embeds: [embed], flags: 64 }); // Ephemeral
  }
}