// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import path from "path";
import { SlashCommandBuilder } from "discord.js";

import { Command } from "../../../interfaces/types";
import { loadJson } from "../../../utils/jsonUtils";
import { getDataAndUser, removeMoney, saveData } from "../data";
import { Item, ShopItemsFile } from "../../../interfaces/econemyData";

const itemsPath = path.join(__dirname, "items.json");

/**
 * Buy command for Discord bot.
 * This command allows users to buy items from the shop.
 * It checks if the item exists, if the user has enough balance, and processes the purchase.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the buy command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const buy: Command = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The name of the item to buy")
        .setRequired(true)
    ),

  async execute(interaction) {
    const itemName = interaction.options.getString("item", true);
    const userId = interaction.user.id;

    const shopItems: ShopItemsFile = loadJson(itemsPath);
    if (!shopItems || !shopItems["shop-items"] || !Array.isArray(shopItems["shop-items"].items)) {
      console.error("[ECO] Shop items data is not available or corrupted.");
      await interaction.reply({
        content: "Shop data is not available or corrupted.",
        flags: 64 // Ephemeral
      });
      return;
    }

    // Find item by name or itemType (fallback)
    let itemObj: Item | undefined = shopItems["shop-items"].items.find((i: Item) => i.name.toLowerCase() === itemName.toLowerCase());
    if (!itemObj) {
      itemObj = shopItems["shop-items"].items.find((i: Item) => i.itemType.toLowerCase() === itemName.toLowerCase());
    }
    if (!itemObj) {
      await interaction.reply({
        content: `Item "${itemName}" not found in the shop.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    const { data, userData } = await getDataAndUser(userId);
    if (!data || !userData) {
      await interaction.reply({
        content: "Failed to retrieve user data.",
        flags: 64 // Ephemeral
      });
      return;
    }

    if (userData.balance < itemObj.price) {
      await interaction.reply({
        content: `❌ You do not have enough fops 🦊 to buy \"${itemObj.name}\". You need **${itemObj.price}** fops 🦊.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    try {
      await removeMoney(userId, itemObj.price);
      if (!userData.inventory) userData.inventory = [];
      userData.inventory.push({ ...itemObj });
      await saveData(data);
      await interaction.reply({
        content: `✅ You have successfully bought \"${itemObj.name}\" for **${itemObj.price}** fops 🦊!`,
      });
    } catch (error) {
      console.error("[ECO] Error while processing buy command:", error);
      await interaction.reply({
        content: `❌ An error occurred while processing your purchase. Please try again later.`,
        flags: 64 // Ephemeral
      });
    }
  }
}