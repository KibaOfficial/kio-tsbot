// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  SlashCommandBuilder,
  CommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import path from "path";
import fs from "fs";
import { Command } from "../../../interfaces/types";
import { Item, ShopItemsFile } from "../../../interfaces/econemyData";
import { loadJson } from "../../../utils/jsonUtils";

const itemsPath = path.join(__dirname, "items.json");

/**
 * Shop command for Discord bot.
 * This command allows users to view the items available for purchase in the economy shop.
 * If the items file does not exist, it initializes with default items.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the shop command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const shop: Command = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription(
      "View the items available for purchase in the economy shop."
    ),

  async execute(interaction) {
    let itemsData: ShopItemsFile;
    if (!fs.existsSync(itemsPath)) {
      const initialItems = {
        "shop-items": {
          name: "Shop Items",
          description: "Items available for purchase in the shop.",
          items: [
            {
              name: "Nickname Change",
              desc: "Change the nickname of the bot in the server for 1 hour.",
              price: 1000,
              itemType: "nickname_change",
              emoji: "📝"
            },
            {
              name: "2x Multiplier",
              desc: "Double your Fops winnings in games for 3 hours.",
              price: 1500,
              itemType: "multiplier",
              emoji: "⏩"
            },
            {
              name: "Ship booster",
              desc: "Increases your chance to get shipped in the next shipping",
              price: 1200,
              itemType: "ship_boost",
              emoji: "🚢"
            },
            {
              name: "Love Letter",
              desc: "Send a highlighted love letter with a custom message.",
              price: 500,
              itemType: "love_letter",
              emoji: "💌"
            },
          ],
        },
      };
      fs.writeFileSync(itemsPath, JSON.stringify(initialItems, null, 2));
      await interaction.reply({
        content: "No items available yet. Initializing shop items... Please try again.",
        flags: 64 // Ephemeral
      });
      return;
    }

    itemsData = loadJson(itemsPath);
    const items: Item[] = itemsData["shop-items"].items || [];

    const embed = new EmbedBuilder()
      .setTitle("Fops 🦊 Shop")
      .setDescription("Here are the items available for purchase:")
      .setColor("#FFD700") // Gold color for the shop
      .setFooter({ text: "Use /buy <item_name> to purchase an item." });

    items.forEach(
      (item: { name: string; price: number; desc: string; emoji?: string }) => {
        embed.addFields({
          name: `${item.emoji ? item.emoji + " " : ""}${item.name}`,
          value: `Price: **${item.price}** fops 🦊\n${item.desc}`,
          inline: false,
        });
      }
    );

    await interaction.reply({ embeds: [embed], flags: 64 }); // Ephemeral
  },
};
