// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../interfaces/types";
import { getUserData } from "./data";

export const balance: Command = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance in the economy system."),

  execute: async (interaction: CommandInteraction) => {
    const userId = interaction.user.id;
    const userData = await getUserData(userId);

    await interaction.reply({
      content:
        `Your balance is: **${userData.balance}** fops 🦊\n\n` +
        `Inventory: ${
          userData.inventory.length > 0
            ? userData.inventory.join(", ")
            : "Empty"
        }`,
    });
  },
};
