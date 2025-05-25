// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionsBitField,
} from "discord.js";
import { Command } from "../../interfaces/types";

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

  async execute(interaction: CommandInteraction) {
    // Only usable in guilds/servers
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64, // ephemeral
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
    if (
      !interaction.memberPermissions?.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    ) {
      await interaction.reply({
        content: "You do not have permission to timeout members.",
        flags: 64, // ephemeral
      });
      return;
    }

    // Check if the bot has permission
    const botMember = await interaction.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await interaction.reply({
        content: "I do not have permission to timeout members.",
        flags: 64, // ephemeral
      });
      return;
    }

    // check if the user is valid
    if (!userToTimeout) {
      await interaction.reply({
        content: "Invalid user specified.",
        flags: 64, // ephemeral
      });
      return;
    }

    // check if the user is trying to timeout themselves
    if (user.id === userToTimeout.id) {
      await interaction.reply({
        content: "You cannot timeout yourself.",
        flags: 64, // ephemeral
      });
      return;
    }

    // check if the user is trying to timeout a bot
    if (userToTimeout.bot) {
      await interaction.reply({
        content: "You cannot timeout a bot.",
        flags: 64, // ephemeral
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
      await interaction.reply({
        content: "You cannot timeout a user with a higher or equal role.",
        flags: 64, // ephemeral
      });
      return;
    }

    // check if the duration is valid 
    // Discord allows timeouts from 1 second to 28 days
    // 1 day = 86400 seconds, 28 days = 2419200 seconds
    if (durationSeconds < 1 || durationSeconds > 2419200) {
      await interaction.reply({
        content: "Duration must be between 1 second and 28 days.",
        flags: 64, // ephemeral
      });
      return;
    }

    // Check if the user is already timed out
    const currentTimeout = memberToTimeout.communicationDisabledUntilTimestamp;
    const now = Date.now();
    const newTimeout = now + durationSeconds * 1000;

    if (currentTimeout && currentTimeout > now && newTimeout <= currentTimeout) {
      await interaction.reply({
        content: `${userToTimeout.tag} is already timed out until <t:${Math.floor(currentTimeout / 1000)}:R>.`,
        flags: 64, // ephemeral
      });
      return;
    }

    // Attempt to timeout the user
    try {
      await memberToTimeout.timeout(durationSeconds * 1000, reason);
      await interaction.reply({
        content: `Successfully timed out ${userToTimeout.tag} for ${durationSeconds} seconds.\nReason: ${reason}`,
        flags: 64, // ephemeral
      });
    } catch (error) {
      console.error(`Error timing out user ${userToTimeout.tag}:`, error);
      await interaction.reply({
        content: `There was an error while trying to timeout ${userToTimeout.tag}.\nReason: ${error}`,
        flags: 64, // ephemeral
      });
      return;
    }
  },
};
