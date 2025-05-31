// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction,  PermissionsBitField, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, ClientEvents, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

/**
 * Command interface for defining Discord bot commands.
 * It includes the command data and an execute function that handles the command interaction.
 * @interface Command - Defines the structure of a command in the Discord bot.
 * @property {SlashCommandBuilder | SlashCommandOptionsOnlyBuilder} data - The command data, which can be a SlashCommandBuilder or a SlashCommandOptionsOnlyBuilder.
 * @property {function} execute - A function that takes a ChatInputCommandInteraction and returns a Promise<void>. This function is called when the command is executed.
 */
export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

/**
 * PermissionFlag type for defining permission flags in Discord.
 * It is derived from the PermissionsBitField.Flags object, allowing for type-safe permission checks.
 * @type PermissionFlag - A type representing the keys of the PermissionsBitField.Flags object.
 * This type can be used to ensure that only valid permission flags are used in the bot's command permissions.
 */
export type PermissionFlag = keyof typeof PermissionsBitField.Flags;

