// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction, CommandInteraction, PermissionsBitField } from "discord.js";
import { PermissionFlag } from "../interfaces/types";

/**
 * Ensures the command is used in a guild (server).
 * If the command is used in a DM or group chat, it replies with an error message.
 * @param interaction - The command interaction from Discord.
 * @returns - A boolean indicating whether the command is used in a guild.
 * @throws - If the command is used in a DM or group chat.
 */
export async function ensureInGuild(interaction: ChatInputCommandInteraction) {
  // Check if the command is used in a guild
  if (!interaction.guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: 64, // Ephemeral message
    });
    return false;
  }
  return true;
}

/**
 * Ensures the user has the required permissions to execute the command.
 * If the user does not have the required permissions, it replies with an error message.
 * If the user is a bot, it replies with an error message.
 * If the user is the owner of the guild, it allows the command to be executed.
 * @param interaction - The command interaction from Discord 
 * @param permissions 
 * @returns 
 */
export async function ensurePermissions(
  interaction: ChatInputCommandInteraction,
  permissions: PermissionFlag[]
): Promise<boolean> {
  const perms = Array.isArray(permissions) ? permissions : [permissions];

  if (!ensureInGuild(interaction)) return false;

  // check if message is from a bot
  if (interaction.user.bot) {
    await interaction.reply({
      content: "Bots cannot execute this command.",
      flags: 64, // Ephemeral message
    });
    return false;
  }

  // always allow the owner to execute commands
  if (interaction.user.id === interaction.guild!.ownerId) return true;

  const memberPerms = interaction.memberPermissions;
  if (!memberPerms || !perms.every(perm => memberPerms.has(perm))) {
    await interaction.reply({
      content: `You do not have the required permissions: ${perms.map(perm => perm.toString()).join(", ")}`,
      flags: 64, // Ephemeral message
    });
    return false;
  }

  return true;
}