// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import path from "path";
import { SlashCommandBuilder, CommandInteraction } from "discord.js";

import { Command } from "../../../interfaces/types";
import { loadJson, saveJson } from "../../utils/jsonUtils";
import { getDataAndUser, removeMoney, saveData } from "../data";
import { ShopData, Item } from "../../../interfaces/econemyData";

const itemsPath = path.join(__dirname, "items.json");
const economyPath = path.join(__dirname, "../economy.json");

export const buy: Command = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The name of the item to buy")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    const itemName = interaction.options.get("item")?.value as string;
    const userId = interaction.user.id;

    const shopData: ShopData = loadJson(itemsPath);
    const shopItems: Item[] = shopData["shop-items"]?.items || [];
    if (!shopData || !shopData["shop-items"] || !Array.isArray(shopData["shop-items"].items)) {
      await interaction.reply({
        content: "Shop data is not available or corrupted.",
        flags: 64, // Suppress the reply
      });
      return;
    }

    const item = shopItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) {
      await interaction.reply({
        content: `❌ Item "${itemName}" not found in the shop.`,
        flags: 64, // Suppress the reply
      });
      return;
    }

    const { data, userData } = await getDataAndUser(userId);
    if (!data || !userData) {
      await interaction.reply({
        content: "Failed to retrieve user data.",
        flags: 64, // Suppress the reply
      });
      return;
    }

    if (userData.balance < item.price) {
      await interaction.reply({
        content: `❌ You do not have enough fops 🦊 to buy "${item.name}". You need **${item.price}** fops 🦊.`,
        flags: 64, // Suppress the reply
      });
      return;
    }

    try {
      await removeMoney(userId, item.price);

      if (!userData.inventory) {
        userData.inventory = [];
      }
      userData.inventory.push(item.type);

      await saveData(data);

      await interaction.reply({
        content: `✅ You have successfully bought "${item.name}" for **${item.price}** fops 🦊!`,
      });
    } catch (error) {
      console.error("[ECO] Error while processing buy command:", error);
      await interaction.reply({
        content: "❌ An error occurred while processing your purchase. Please try again later.",
        flags: 64, // Suppress the reply
      });
      return;
    }

  }
}