// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction, User as DiscordUser } from "discord.js";
import { Command, PermissionFlag } from "../interfaces/types";
import { AppDataSource } from "./data/db";
import { User } from "./data/entity/User";
import { Ship } from "./data/entity/Ship";

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
    // check if interaction message got already defered
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    await interaction.editReply({
      content: "This command can only be used in a server.",
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

  // Check: In Guild?
  if (!(await ensureInGuild(interaction))) return false;

  // no need to check if the user is a bot, as this is already ensured by the interactionCreate event handler

  // always allow the owner to execute commands
  if (interaction.user.id === interaction.guild!.ownerId) return true;

  const memberPerms = interaction.memberPermissions;
  if (!memberPerms || !perms.every(perm => memberPerms.has(perm))) {
    // check if interaction message got already defered
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }
    await interaction.editReply({
      content: `You do not have the required permissions: ${perms.map(perm => perm.toString()).join(", ")}`,
    });
    return false;
  }

  return true;
}

/**
 * Converts a Discord user to a User entity.
 * This function checks if the user exists in the database, and if not, creates a new User entity with default data.
 * @param {DiscordUser} target - The Discord user to convert.
 * @returns {Promise<User>} - A promise that resolves to the User entity.
 * @throws - If the user does not exist, a new User entity is created with default data.
 */
export async function convertDiscordUserToUser(target: DiscordUser): Promise<User> {
  // Get: User
  const userId = target.id;
  const userRepo = AppDataSource.getRepository(User)
  let user = await userRepo.findOne({
    where: { id: userId }
  });

  if (!user) {
    // If user does not exist, create a new user with default data
    user = new User(
      userId,
      0,
      undefined,
      [],
      undefined
    );
    await userRepo.save(user)
    console.log(`[ECO] Created new user ${userId} with default data.`);
  }
  return user;
}

/**
 * Increments the pair count for a shipping pair in the database.
 * This function retrieves the existing shipping data for the guild, increments the count for the specified pair, and saves the updated data back to the database.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from Discord.
 * @param {User} user1 - The first user in the shipping pair.
 * @param {User} user2 - The second user in the shipping pair.
 * @returns {Promise<void>} - A promise that resolves when the pair count is successfully incremented.
 * @throws - If the ship data does not exist, a new Ship object is created with default values.
 */
export async function incrementPairCount(interaction: ChatInputCommandInteraction, user1: User, user2: User) {
  const shipRepo = AppDataSource.getRepository(Ship);
  const pairKey = `${user1.id}-${user2.id}`;
  let ship = await shipRepo.findOne({ where: { id: interaction.guild!.id } });
  if (!ship) {
    ship = new Ship(
      interaction.guild!.id, // Guild ID
      ["", ""], // Last pair (initially empty)
      {}, // Pairs count (initially empty)
    );
    
  } else {
    ship.pairsCount[pairKey] = (ship.pairsCount[pairKey] || 0) + 1;
    ship.lastPair = [user1.id, user2.id];
  }
  await shipRepo.save(ship);
}

/**
 * Formats the commands description for display.
 * This function takes an array of commands and formats their names and descriptions into a string.
 * It handles nested commands and options, providing a clear hierarchy in the output.
 * @param cmds An array of commands to format.
 * @param indent An optional string to indent the output for better readability.
 * @returns A formatted string containing the commands and their descriptions.
 */
export function formatCommandsDescription(cmds: Array<Command & { category: string }>, indent = ""): string {
  let lines: string[] = [];
  for (const cmd of cmds) {
    lines.push(`${indent}└ \`/${cmd.data.name}\`: ${cmd.data.description || "No description"}`);
    const dataJson = cmd.data.toJSON();
    if (Array.isArray(dataJson.options)) {
      for (const opt of dataJson.options) {
        if (opt.type === 1) {
          lines.push(`${indent}    └ \`/${cmd.data.name} ${opt.name}\`: ${opt.description || "No description"}`);
        } else if (opt.type === 2 && Array.isArray(opt.options)) {
          for (const sub of opt.options) {
            if (sub.type === 1) {
              lines.push(`${indent}    └ \`/${cmd.data.name} ${opt.name} ${sub.name}\`: ${sub.description || "No description"}`);
            }
          }
        }
      }
    }
  }
  return lines.join("\n").trim() || "No commands available in this category.";
}