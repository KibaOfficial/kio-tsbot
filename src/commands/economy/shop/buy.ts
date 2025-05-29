// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";

import { Command } from "../../../interfaces/types";
import { AppDataSource } from "../../../utils/data/db";
import { Shop } from "../../../utils/data/entity/Shop";
import { Item } from "../../../utils/data/entity/Item";
import { User } from "../../../utils/data/entity/User";
import { addItem } from "../data";

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
        .addChoices(
          { name: "Nickname Change", value: "nickname_change" },
          { name: "Multiplier", value: "multiplier" },
        ),
    ),

  async execute(interaction) {
    const itemName = interaction.options.getString("item", true);
    const userId = interaction.user.id;

    // load shop from DB
    const shop = await AppDataSource.getRepository(Shop).findOne({ where: { id: 1 } });

    // get user data from db
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      // If user does not exist, create a new user with default data
      user = new User(
        userId,
        0,
        undefined, // lastDaily
        [], // inventory
        undefined // multiplierExpiresAt
      );
    }

    // Find item by name
    const shopItem = shop!.items.find((i: Item) => i.name.toLowerCase() === itemName.toLowerCase() || i.itemType.toLowerCase() === itemName.toLowerCase());
    if (!shopItem) {
      await interaction.reply({
        content: `Item "${itemName}" not found in the shop.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    // Check if the user has enough balance
    if (user.balance < shopItem.price) {
      await interaction.reply({
        content: `You do not have enough fops 🦊 to buy "${shopItem.name}". You need **${shopItem.price}** fops 🦊.`,
        flags: 64 // Ephemeral
      });
      return;
    }

    // Deduct the price from the user's balance
    user.balance -= shopItem.price;
    // Add the item to the user's inventory
    if (!(await addItem(userId, shopItem))) {
      console.log(`[ECO] Failed to add item ${shopItem.name} to user ${userId}'s inventory.`);
      await interaction.reply({
        content: `❌ Failed to add item "${shopItem.name}" to your inventory. Please try again later.`,
        flags: 64 // Ephemeral
      });
      return;
    }
    // Reply to the user with a success message
    await interaction.reply({
      content: `✅ You have successfully bought "${shopItem.name}" for **${shopItem.price}** fops 🦊!`,
      flags: 64 // Ephemeral
    });

    console.log(`[ECO] User ${interaction.user.username} (${userId}) bought item: ${shopItem.name} for ${shopItem.price} fops 🦊`);
  }
}