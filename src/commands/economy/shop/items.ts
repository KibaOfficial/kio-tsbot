// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { Command } from "../../../interfaces/types";
import path from "path";
import { loadJson, saveJson } from "../../../utils/jsonUtils";
import { useNicknameChange } from "./items/nickname_change";
import { Item, ShopItemsFile } from "../../../interfaces/econemyData";

const itemsPath = path.join(__dirname, "items.json");
const economyPath = path.join(__dirname, "../economyData.json");

/**
 * Command to use an item from the user's inventory.
 * This command allows users to use items they have purchased from the shop.
 * It checks if the user has the item, removes it from their inventory, and executes the item's effect.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the item command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 * @throws {Error} - If the item is not found in the shop or the user's inventory, or if the item cannot be used.
 */
export const item: Command = {
  data: new SlashCommandBuilder()
    .setName("item")
    .setDescription("Use an item from your inventory.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The name of the item to use")
        .setRequired(true)
    ),

  async execute(interaction) {
    const itemName = interaction.options.getString("item", true);
    const userId = interaction.user.id;

    // load items and economy data
    const itemsData: ShopItemsFile = loadJson(itemsPath);
    const allUserData = loadJson(economyPath);

    // Ensure users property exists
    if (!allUserData.users) allUserData.users = {};
    const userData = allUserData.users[userId];

    if (!userData || !userData.inventory || !Array.isArray(userData.inventory)) {
      await interaction.reply({
        content: "You have no items in your inventory.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // find item by name or itemType
    let itemObj = itemsData["shop-items"].items.find((i: Item) => i.name.toLowerCase() === itemName.toLowerCase());
    if (!itemObj) {
      // Try to find by type as fallback (for users entering the type directly)
      itemObj = itemsData["shop-items"].items.find((i: Item) => i.itemType.toLowerCase() === itemName.toLowerCase());
    }
    if (!itemObj) {
      await interaction.reply({
        content: `Item "${itemName}" not found in the shop.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // check if user has the item in their inventory
    const itemIdx = userData.inventory.findIndex((invItem: Item) => invItem.itemType === itemObj.itemType);
    if (itemIdx === -1) {
      await interaction.reply({
        content: `You do not have the item "${itemName}" in your inventory.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // remove item from inventory
    userData.inventory.splice(itemIdx, 1);
    allUserData.users[userId] = userData;
    saveJson(economyPath, allUserData);

    switch (itemObj.itemType) {
      case "nickname_change":
        await useNicknameChange(interaction, userId, userData, allUserData);
        break;
      case "multiplier":
        await interaction.reply({
          content: `You have used the item **${itemObj.name}**. (Multiplier logic coming soon.)`,
          flags: MessageFlags.Ephemeral
        });
        break;
      case "ship_boost":
        await interaction.reply({
          content: `You have used the item **${itemObj.name}**. (Shipping boost logic coming soon.)`,
          flags: MessageFlags.Ephemeral
        });
        break;
      case "love_letter":
        await interaction.reply({
          content: `You have used the item **${itemObj.name}**. (Love letter logic coming soon.)`,
          flags: MessageFlags.Ephemeral
        });
        break;
      default:
        await interaction.reply({
          content: "This item cannot currently be used.",
          flags: MessageFlags.Ephemeral
        });
        break;
    }
  }
}