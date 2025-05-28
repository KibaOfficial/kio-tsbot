// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { transferMoney } from "./data";

/**
 * Pay command for Discord bot.
 * This command allows users to send fops 🦊 to another user.
 * It checks if the user has provided a valid amount and user to pay.
 * If the transfer is successful, it confirms the transaction.
 * If there is an error, it provides feedback on the failure.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the pay command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const pay: Command = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Send fops to another user.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to pay")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("The amount of fops to send")
        .setRequired(true)
    ),
  async execute(interaction) {
    const fromUserId = interaction.user.id;
    const toUser = interaction.options.getUser("user", true);
    const toUserId = toUser.id;
    const amount = interaction.options.getInteger("amount", true);

    if (!toUserId || amount <= 0 || isNaN(amount)) {
      await interaction.reply({
        content: "Invalid user or amount. Please provide a valid user and a positive amount.",
        flags: 64 // Ephemeral
      });
      return;
    }

    try {
      await transferMoney(fromUserId, toUserId, amount);
      await interaction.reply({
        content: `✅ Successfully sent **${amount}** fops 🦊 to <@${toUserId}>!`,
      });
    } catch (error) {
      console.error("[ECO] Error during money transfer:", error);
      await interaction.reply({
        content: `❌ An error occurred while trying to send fops: ${error instanceof Error ? error.message : String(error)}\n\nPlease try again later.`,
        flags: 64 // Ephemeral
      });
    }
  }
}