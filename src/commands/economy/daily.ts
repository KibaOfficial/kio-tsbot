// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { getDataAndUser, saveData } from "./data";
import * as dotenv from "dotenv";

dotenv.config();

const DAILY_AMOUNT = parseInt(process.env.DAILY_AMOUNT ?? "100");

export const daily = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward for some free fops! 🦊"),

  async execute(interaction: CommandInteraction) {
    const userId = interaction.user.id;
    const now = Date.now();

    const { data, userData } = await getDataAndUser(userId);

    if (
      !userData.lastDaily ||
      now - userData.lastDaily >= 24 * 60 * 60 * 1000
    ) {
      userData.lastDaily = now;
      userData.balance += DAILY_AMOUNT;

      await saveData(data);
      await interaction.reply({
        content: `You have claimed your daily reward of ${DAILY_AMOUNT} fops 🦊! Your new balance is ${userData.balance} fops 🦊.`,
      });
    } else {
      // Calculate the time remaining until the next daily claim
      const timeRemaining = 24 * 60 * 60 * 1000 - (now - userData.lastDaily);
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      await interaction.reply({
        content: `You have already claimed your daily reward today! Come back in **${hours}h ${minutes}m ${seconds}s** to claim again.`,
      });
    }
  },
};
