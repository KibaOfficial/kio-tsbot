// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../../interfaces/types";
import { Shop } from "../../../utils/data/entity/Shop";
import { Item } from "../../../utils/data/entity/Item";
import { AppDataSource } from "../../../utils/data/db";
import { removeItem } from "../data";
import { useMultiplier } from "./items/multiplier";
import { useNicknameChange } from "./items/nickname_change";
import { User } from "../../../utils/data/entity/User";

/**
 * Command to use an item from the user's inventory.
 * This command allows users to select an item from their inventory
 * and apply its effect, such as changing the bots username or applying a multiplier.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed. 
 * @throws {Error} - If the item is not found in the shop or if the user does not have the item in their inventory.
 */
export const item: Command = {
  data: new SlashCommandBuilder()
    .setName("item")
    .setDescription("Use an item from your inventory.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The name of the item to buy")
        .setRequired(true)
        .addChoices(
          { name: "Nickname Change", value: "nickname_change" },
          { name: "Multiplier", value: "multiplier" },
        )
    ),

  async execute(interaction) {
    const itemName = interaction.options.getString("item", true);

    // Fetch the shop and find the item by name or type
    const shop = await AppDataSource.getRepository(Shop).findOne({ where: { id: 1} });
    let itemObj = shop!.items.find((i: Item) => 
      i.name.toLowerCase() === itemName.toLowerCase() ||
      i.itemType.toLowerCase() === itemName.toLowerCase()
    );
    if (!itemObj) {
      await interaction.reply({
        content: `Item "${itemName}" not found in the shop.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { id: interaction.user.id } });
    if (!user) {
      // If user does not exist, create a new user with default
      user = new User(
        interaction.user.id,
        0, // balance
        undefined, // lastDaily
        [], // inventory
        undefined // multiplierExpiresAt
      );
    }

    // Check if the user has the item in their inventory
    const hasItem = user.inventory.some(invItem => invItem.itemType === itemObj.itemType);
    if (!hasItem) {
      await interaction.reply({
        content: `You do not have the item "${itemObj.name}" in your inventory.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    // Execute the item's effect based on its type
    switch (itemObj.itemType) {
      case "nickname_change":
        // Remove the item from the user's inventory after use
        await removeItem(interaction.user.id, itemObj.name);
        await useNicknameChange(interaction);
        break;
      case "multiplier":
        // Remove the item from the user's inventory after use
        await removeItem(interaction.user.id, itemObj.name);
        await useMultiplier(interaction);
        break;
      default:
        await interaction.reply({
          content: `Item "${itemObj.name}" does not have a defined effect yet. Please check back later!`,
          flags: 64 // Ephemeral
        });
        break;
    }
  }
}