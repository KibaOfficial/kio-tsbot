// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../interfaces/types";
import { ensureInGuild, ensurePermissions } from "../../utils/utils";

/**
 * Clear command for Discord bot.
 * This command allows a user with the appropriate permissions to clear messages from a text channel.
 * It checks if the user has permission to manage messages, and if so, it clears the specified number of messages or all messages in the channel.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the clear command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 * @throws - If the command is used outside of a guild, if the user lacks permissions, or if the channel is not a text channel.
 */
export const clear: Command = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear messages from a channel")
    .addStringOption((option) =>
      option
        .setName("amount")
        .setDescription(
          "Number of messages to clear or 'all' to clear the entire channel"
        )
        .setRequired(true)
        .addChoices(
          { name: "All", value: "all" },
          { name: "10", value: "10" },
          { name: "20", value: "20" },
          { name: "50", value: "50" },
          { name: "100", value: "100" }
        )
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (!(await ensureInGuild(interaction))) return;

    // check if user has permission to manage messages
    if (!(await ensurePermissions(interaction, ["ManageMessages"]))) return;
    const options = interaction.options.getString("amount", true);
    const amount =
      options.toLowerCase() === "all" ? "all" : parseInt(options, 10);

    const channel = interaction.channel;

    
    // check if the channel is a text channel
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.reply({
        content: "This command can only be used in a text channel.",
        flags: 64, // Ephemeral message
      });
      return;
    }
    
    const textChannel = channel as TextChannel;
    
    try {
      await interaction.deferReply({ flags: 64 }); // Ephemeral message

      if (amount === "all") {
        let fetched;
        let totalDeleted = 0;

        do {
          fetched = await textChannel.bulkDelete(100, true); // true = ignore messages older than 14 days
          totalDeleted += fetched.size;
        } while (fetched.size > 0);

        await interaction.editReply({
          content: `🧹 Successfully cleared **${totalDeleted}** messages from the channel.`,
        });
      } else {
        const deleted = await textChannel.bulkDelete(amount, true);
        await interaction.editReply({
          content: `🧹 Successfully cleared **${deleted.size}** messages from the channel.`,
        });
      }
    } catch (error) {
      console.error("[Moderation] Error clearing messages:", error);
      await interaction.editReply({
        content:
          "❌ An error occurred while trying to clear messages. Please try again later.",
      });
    }
  },
};
