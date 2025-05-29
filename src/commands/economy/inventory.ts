// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { AppDataSource } from "../../utils/data/db";
import { User } from "../../utils/data/entity/User";


/**
 * Command to check the user's inventory in the economy system.
 * This command retrieves the user's inventory from the database,
 * checks if the user exists, and if they have any items in their inventory.
 * If the user does not exist, it creates a new user with an empty inventory.
 * If the user has items, it formats them into an embed message and replies to the interaction.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If there is an error while retrieving or saving the user data.
 */
export const inventory: Command = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Check your inventory in the economy system."),

  execute: async (interaction) => {
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOneBy({ id: interaction.user.id });
    if (!user) {
      // If user does not exist, create a new user with default data
      user = new User(
        interaction.user.id,
        0, // balance
        undefined, // lastDaily
        undefined, // inventory
        undefined // multiplierExpiresAt
      );
      await userRepository.save(user);
      await interaction.reply({
        content: "You have been registered in the economy system. Your inventory is empty.",
        flags: 64, // Ephemeral
      });
      return;
    }
    
    // Check if the user has an inventory and if it's not empty
    if (!user.inventory || !Array.isArray(user.inventory) || user.inventory.length === 0) {
      await interaction.reply({
        content: "Your inventory is empty.",
        flags: 64, // Ephemeral
      });
      return;
    }
    // Create a list of items in the inventory
    const inventoryItems = user.inventory.map((item) => {
      return `**${item.emoji ? item.emoji + " " : ""}${item.name}** - ${item.desc}`;
    }).join("\n");
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Your Inventory")
      .setDescription(inventoryItems)
      .setFooter({ text: "Use /shop to buy more items." });
    await interaction.reply({ embeds: [embed], flags: 64 }); // Ephemeral
  }
}