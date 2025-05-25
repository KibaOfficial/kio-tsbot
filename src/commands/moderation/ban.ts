// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction, PermissionsBitField } from "discord.js";
import { Command } from "../../interfaces/types";

export const ban: Command = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .addUserOption(option => (
      option.setName("user")
        .setDescription("The user to ban")
        .setRequired(true)
    ))
    .addStringOption(option => (
      option.setName("reason")
        .setDescription("The reason for the ban")
        .setRequired(false)
    )),

  async execute(interaction: CommandInteraction) {
    // check if the command is executed in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64, // Ephemeral
      });
      return;
    }

    const targetUser = interaction.options.get("user")?.user;
    const reason = interaction.options.get("reason")?.value as string || "No reason provided";

    // check if the target user is provided
    if (!targetUser) {
      await interaction.reply({
        content: "You must specify a user to ban.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // check if the user is trying to ban themselves
    if (targetUser.id === interaction.user.id) {
      await interaction.reply({
        content: "You cannot ban yourself.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // check if the user has permission to ban members
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: "You do not have permission to ban members.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // check if the bot has permission to ban members 
    const botMember = await interaction.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: "I do not have permission to ban members.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // check if the target user is a member of the guild
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    // If the target user is not a member, inform the user
    if (!targetMember) {
      await interaction.reply({
        content: "The specified user is not a member of this server.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // check if the target is a bot or has a higher role than the bot or is the server owner
    if (
      targetMember.user.bot || 
      targetMember.roles.highest.position >= botMember.roles.highest.position || 
      targetMember.id === interaction.guild.ownerId
    ) {
      await interaction.reply({
        content: "I cannot ban this user due to role hierarchy or they are a bot.",
        flags: 64, // Ephemeral
      });
      return;
    }

    // Attempt to ban the user
    try {
      await interaction.guild.members.ban(targetUser.id, {
        reason: reason,
      });
      await interaction.reply({
        content: `✅ Successfully banned **${targetUser.tag}** (<@${targetUser.id}>).\nReason: ${reason}`,
        flags: 64, // Ephemeral
      });

    } catch (error) {
      console.error("[MOD] Error banning user:", error);
      await interaction.reply({
        content: "An error occurred while trying to ban the user. Please try again later.",
        flags: 64, // Ephemeral
      });
    }

  }
}