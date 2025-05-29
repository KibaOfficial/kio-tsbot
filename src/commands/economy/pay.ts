// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { transferMoney } from "./data";
import { convertDiscordUserToUser } from "../../utils/utils";

/**
 * Command to send fops to another user.
 * This command allows a user to transfer a specified amount of fops to another user.
 * It checks if the sender has sufficient balance and handles errors gracefully.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If the transfer is invalid (e.g., transferring to oneself, insufficient balance, or invalid amount).
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
    const fromUser = await convertDiscordUserToUser(interaction.user);
    const toUser = await convertDiscordUserToUser(interaction.options.getUser("user", true));
    const amount = interaction.options.getInteger("amount", true);

    try {
      await transferMoney(fromUser, toUser, amount);
      await interaction.reply({
        content: `✅ Successfully sent **${amount}** fops 🦊 to <@${toUser.id}>!`,
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