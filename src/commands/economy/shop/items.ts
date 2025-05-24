// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { SlashCommandBuilder, CommandInteraction, MessageFlags } from "discord.js";
import { Command } from "../../../interfaces/types";
import path from "path";
import { loadJson, saveJson } from "../../utils/jsonUtils";
import { saveData } from "../data";
import { useNicknameChange } from "./items/nickname_change";

const itemsPath = path.join(__dirname, "items.json");
const economyPath = path.join(__dirname, "../economyData.json");

export const item: Command = {
  data: new SlashCommandBuilder()
    .setName("item")
    .setDescription("Use an item from your inventory.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("The name of the item to use")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    const itemName = interaction.options.get("item")?.value as string;
    const userId = interaction.user.id;

    // load items and economy data
    const itemsData = loadJson(itemsPath);
    const shopItems = itemsData['shop-items']?.items || [];
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

    // find item in shop to get type
    let itemObj = shopItems.find((i: any) => i.name.toLowerCase() === itemName.toLowerCase());
    if (!itemObj) {
      // Try to find by type as fallback (for users entering the type directly)
      itemObj = shopItems.find((i: any) => i.type.toLowerCase() === itemName.toLowerCase());
    }
    if (!itemObj) {
      await interaction.reply({
        content: `Item "${itemName}" not found in the shop.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // check if user has the item in their inventory
    const itemIdx = userData.inventory.indexOf(itemObj.type);
    if (itemIdx === -1) {
      await interaction.reply({
        content: `You do not have the item "${itemName}" in your inventory.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // remove item from inventory
    userData.inventory.splice(itemIdx, 1);
    allUserData.users[userId] = userData; // <-- Das ist wichtig!
    saveJson(economyPath, allUserData);

    switch (itemObj.type) {
      case "nickname_change":
        // TODO: Implement nickname change logic
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