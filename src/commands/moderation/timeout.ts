// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} from "discord.js";
import { Command } from "../../interfaces/types";
import { ensurePermissions } from "../../utils/utils";
import { ResponseBuilder } from "../../utils/responses";

/**
 * Timeout command for Discord bot.
 * This command allows moderators to timeout a user in the server for a specified duration.
 * It checks if the user has permission to timeout members and if the bot has the required permissions.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the timeout command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const timeout: Command = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user in the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the timeout in seconds")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the timeout")
        .setRequired(false)
    ),

  async execute(interaction) {    // Only usable in guilds/servers
    if (!interaction.guild) {
      const embed = ResponseBuilder.error(
        "Guild Only Command",
        "This command can only be used in a server.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // get comamnd options
    const user = interaction.user; // the user who invoked the command
    const userToTimeout = interaction.options.get("user")?.user; // the user to timeout
    const durationSeconds = interaction.options.get("duration")?.value as number; // duration in seconds
    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "No reason provided"; // reason for the timeout

    // check if the user has permission to timeout members
    if (await ensurePermissions(interaction, ["ModerateMembers"])) {
      const embed = ResponseBuilder.moderation(
        "Permission Denied",
        "❌ You do not have permission to timeout members.\n\n**Required Permission:** `Moderate Members`",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if the bot has permission
    const botMember = await interaction.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const embed = ResponseBuilder.error(
        "Bot Permission Error",
        "❌ I do not have permission to timeout members.\n\n**Required Permission:** `Moderate Members`",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // check if the user is valid
    if (!userToTimeout) {
      const embed = ResponseBuilder.error(
        "Invalid User",
        "❌ Invalid user specified.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // check if the user is trying to timeout themselves
    if (user.id === userToTimeout.id) {
      const embed = ResponseBuilder.error(
        "Self-Timeout Error",
        "❌ You cannot timeout yourself.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // check if the user is trying to timeout a bot
    if (userToTimeout.bot) {
      const embed = ResponseBuilder.error(
        "Bot Timeout Error",
        "❌ You cannot timeout a bot.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // check if the user is trying to timeout a user with higher/equal role or the owner
    const memberToTimeout = await interaction.guild.members.fetch(
      userToTimeout.id
    );
    if (
      memberToTimeout.roles.highest.position >=
        botMember.roles.highest.position ||
      memberToTimeout.id === interaction.guild.ownerId
    ) {
      const embed = ResponseBuilder.error(
        "Role Hierarchy Error",
        "❌ You cannot timeout a user with a higher or equal role.",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // check if the duration is valid 
    // Discord allows timeouts from 1 second to 28 days
    // 1 day = 86400 seconds, 28 days = 2419200 seconds
    if (durationSeconds < 1 || durationSeconds > 2419200) {
      const embed = ResponseBuilder.error(
        "Invalid Duration",
        "❌ Duration must be between 1 second and 28 days.\n\n**Valid range:** 1 - 2,419,200 seconds",
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if the user is already timed out
    const currentTimeout = memberToTimeout.communicationDisabledUntilTimestamp;
    const now = Date.now();
    const newTimeout = now + durationSeconds * 1000;

    if (currentTimeout && currentTimeout > now && newTimeout <= currentTimeout) {
      const embed = ResponseBuilder.warning(
        "User Already Timed Out",
        `⚠️ ${userToTimeout.tag} is already timed out until <t:${Math.floor(currentTimeout / 1000)}:R>.`,
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Attempt to timeout the user
    try {
      await memberToTimeout.timeout(durationSeconds * 1000, reason);
      
      // Helper function to format duration
      const formatDuration = (seconds: number): string => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
        
        return parts.join(' ');
      };

      const embed = ResponseBuilder.moderation(
        "User Timed Out",
        `✅ Successfully timed out **${userToTimeout.tag}**\n\n**Duration:** ${formatDuration(durationSeconds)}\n**Reason:** ${reason}\n**Expires:** <t:${Math.floor((now + durationSeconds * 1000) / 1000)}:R>`,
        interaction.client
      );
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`[MOD] Error timing out user ${userToTimeout.tag}:`, error);
      const embed = ResponseBuilder.error(
        "Timeout Failed",
        `❌ There was an error while trying to timeout **${userToTimeout.tag}**.\n\n**Error:** ${error}`,
        interaction.client
      );
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  },
};
