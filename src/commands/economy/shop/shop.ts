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

const itemsPath = path.join(__dirname, "items.json");


export const shop: Command = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription(
      "View the items available for purchase in the economy shop."
    ),

  async execute(interaction: CommandInteraction) {
    let itemsData: any;
    if (!fs.existsSync(itemsPath)) {
      const initialItems = {
        "shop-items": {
          name: "Shop Items",
          description: "Items available for purchase in the shop.",
          items: [
            {
              name: "Nickname Change",
              description: "Change your nickname in the server for 1 hour.",
              price: 1000,
              type: "nickname_change",
            },
            {
              name: "2x Multiplier",
              description: "Double your Fops winnings in games for 3 hours.",
              price: 1500,
              type: "multiplier",
            },
            {
              name: "Ship Booster",
              description:
                "Increases your chance to be shipped for the next shipping.",
              price: 1200,
              type: "ship_boost",
            },
            {
              name: "Love Letter",
              description:
                "Send a highlighted love letter with a custom message.",
              price: 500,
              type: "love_letter",
            },
          ],
        },
      };
      fs.writeFileSync(itemsPath, JSON.stringify(initialItems, null, 2));
      await interaction.reply({
        content: "No items available yet. Initializing shop items... Please try again.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    itemsData = JSON.parse(fs.readFileSync(itemsPath, "utf-8"));
    const items = itemsData["shop-items"]?.items || [];

    const embed = new EmbedBuilder()
      .setTitle("Fops 🦊 Shop")
      .setDescription("Here are the items available for purchase:")
      .setColor("#FFD700") // Gold color for the shop
      .setFooter({ text: "Use /buy <item_name> to purchase an item." });

    items.forEach(
      (item: { name: string; price: number; description: string }) => {
        embed.addFields({
          name: item.name,
          value: `Price: **${item.price}** fops 🦊\n${item.description}`,
          inline: false,
        });
      }
    );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
