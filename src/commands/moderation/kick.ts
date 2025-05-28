// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  SlashCommandBuilder,
  PermissionsBitField,
} from "discord.js";
import { Command } from "../../interfaces/types";
import { ensurePermissions } from "../../utils/utils";

/**
 * Kick command for Discord bot.
 * This command allows a user with the appropriate permissions to kick another user from the server.
 * It checks if the user has permission to kick members, if the bot has permission to kick members,
 * and if the user to be kicked is not the bot itself or has a higher role than the bot.
 * If all checks pass, it attempts to kick the user and provides feedback on the success or failure of the operation.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the kick command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 * @throws - If the command is used outside of a guild, if the user lacks permissions, or if the bot cannot kick the specified user.
 */
export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kicking the user")
        .setRequired(false)
    ),
  async execute(interaction) {
    // Only usable in guilds/servers
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    // Check if the user has permission to kick members
    if (await ensurePermissions(interaction, ["KickMembers"])) {
      await interaction.reply({
        content: "You do not have permission to kick members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the bot has permission
    const botMember = await interaction.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await interaction.reply({
        content: "I do not have permission to kick members.",
        ephemeral: true,
      });
      return;
    }

    // Get the user to kick and the reason
    const user = interaction.options.get("user")?.user;

    // check if user is provided
    if (!user) {
      await interaction.reply({
        content: "You must specify a user to kick.",
        ephemeral: true,
      });
      return;
    }

    // Get the reason for kicking
    // If no reason is provided, default to "No reason provided"
    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "No reason provided";

    // Prevent self-kick
    if (user.id === interaction.user.id) {
      await interaction.reply({
        content: "You cannot kick yourself.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // Attempt to kick the user
    try {
      const member = await interaction.guild.members.fetch(user.id);

      // Prevent kicking higher/equal roles or the owner
      if (
        member.roles.highest.position >= botMember.roles.highest.position ||
        member.id === interaction.guild.ownerId
      ) {
        await interaction.reply({
          content:
            "I cannot kick this user due to role hierarchy or because they are the server owner.",
          flags: 64, // Ephemeral
        });
        return;
      }

      await member.kick(`${reason} (Kicked by ${interaction.user.tag})`);
      await interaction.reply({
        content: `✅ Successfully kicked **${user.tag}**. Reason: ${reason}`,
        flags: 64, // Ephemeral
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ Unable to kick **${user.tag}**. Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        flags: 64, // Ephemeral
      });
    }
  },
};
