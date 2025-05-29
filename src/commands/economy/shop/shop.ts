// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../../interfaces/types";
import { Item } from "../../../utils/data/entity/Item";
import { Shop } from "../../../utils/data/entity/Shop";
import { AppDataSource } from "../../../utils/data/db";

/**
 * Command to view the economy shop.
 * This command retrieves the shop data from the database,
 * creates an embed with the shop items,
 * and replies to the interaction with the embed.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If the shop data is not available or if there are no items in the shop.
 */
export const shop: Command = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription(
      "View the items available for purchase in the economy shop."
    ),

  async execute(interaction) {
    const shop = await AppDataSource.getRepository(Shop).findOne({
      where: { id: 1 },
    });
    if (!shop) {
      await interaction.reply({
        content: "Shop data is not available.",
        flags: 64, // Ephemeral
      });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(shop.name)
      .setDescription(shop.description)
      .setColor(0xff9900);
    shop.items.forEach((item: Item) => {
      embed.addFields({
        name: `${item.emoji ? item.emoji + " " : ""}${item.name}`,
        value: `Price: **${item.price}** fops 🦊\n${item.desc}`,
        inline: false,
      });
    });
    await interaction.reply({ embeds: [embed], flags: 64 }); // Ephemeral
  },
};
