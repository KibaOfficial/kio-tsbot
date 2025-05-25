// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, MessageFlags } from "discord.js";
import { Command } from "../../interfaces/types";
import { transferMoney } from "./data";

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
  async execute(interaction: CommandInteraction) {
    const fromUserId = interaction.user.id;
    const toUser = interaction.options.get("user")?.user;
    const toUserId = toUser?.id;
    const amount = interaction.options.get("amount")?.value as number;

    if (!toUserId || amount <= 0 || isNaN(amount)) {
      await interaction.reply({
        content: "Invalid user or amount. Please provide a valid user and a positive amount.",
        flags: MessageFlags.Ephemeral,
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
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}