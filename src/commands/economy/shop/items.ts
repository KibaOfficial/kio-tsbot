// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { Command } from "../../../interfaces/types";
import path from "path";
import { loadJson } from "../../../utils/jsonUtils";
import { useNicknameChange } from "./items/nickname_change";
import { Item, ShopItemsFile } from "../../../interfaces/econemyData";
import { useMultiplier } from "./items/multiplier";
import { getDataAndUser, removeItem } from "../data";

const itemsPath = path.join(__dirname, "items.json");

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

    // load shop items data
    const itemsData: ShopItemsFile = loadJson(itemsPath);
    if (!itemsData["shop-items"] || !Array.isArray(itemsData["shop-items"].items)) {
      await interaction.reply({
        content: "Shop items data is not available or corrupted.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Find item by name or itemType (fallback)
    // This allows users to use items by their name or itemType
    let itemObj = itemsData["shop-items"].items.find((i: Item) => i.name.toLowerCase() === itemName.toLowerCase());
    if (!itemObj) {
      itemObj = itemsData["shop-items"].items.find((i: Item) => i.itemType.toLowerCase() === itemName.toLowerCase());
    }
    if (!itemObj) {
      await interaction.reply({
        content: ` Item "${itemName}" not found in the shop.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check if the user has the item in their inventory
    const { userData } = await getDataAndUser(userId);
    if (!userData || !Array.isArray(userData.inventory) || userData.inventory.length === 0) {
      await interaction.reply({
        content: "You don't have any items in your inventory.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Check if the user has the item in their inventory
    const hasItem = userData.inventory.some(invItem => invItem.itemType === itemObj.itemType);
    if (!hasItem) {
      await interaction.reply({
        content: `You do not have the item "${itemObj.name}" in your inventory.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Remove the item from the user's inventory (decrements quantity or removes if last)
    await removeItem(userId, itemObj.itemType);

    // Execute the item's effect based on its type
    switch (itemObj.itemType) {
      case "nickname_change":
        await useNicknameChange(interaction);
        break;
      case "multiplier":
        await useMultiplier(interaction);
        break;
      case "ship_boost":
        await interaction.reply({
          content: ``,
          flags: MessageFlags.Ephemeral
        });
        break;
      case "love_letter":
        await interaction.reply({
          content: ``,
          flags: MessageFlags.Ephemeral
        });
        break;
      default:
        await interaction.reply({
          content: "",
          flags: MessageFlags.Ephemeral
        });
        break;
    }
  }
}