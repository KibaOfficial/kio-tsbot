// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../interfaces/types";
import { Item } from "../../../utils/data/entity/Item";
import { Shop } from "../../../utils/data/entity/Shop";
import { AppDataSource } from "../../../utils/data/db";
import { ResponseBuilder } from "../../../utils/responses";

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
    });    if (!shop) {
      const embed = ResponseBuilder.economy(
        "Shop Unavailable",
        "The shop is currently unavailable. Please try again later.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral, // Ephemeral
      });
      return;
    }

    const embed = ResponseBuilder.economy(
      shop.name,
      shop.description,
      interaction.client
    );

    shop.items.forEach((item: Item) => {
      embed.addFields({
        name: `${item.emoji ? item.emoji + " " : ""}${item.name}`,
        value: `Price: **${item.price}** fops 🦊\n${item.desc}`,
        inline: false,
      });
    });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral }); // Ephemeral
  },
};
