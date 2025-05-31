// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from "discord.js";
import { Command } from "./interfaces/types";
import { join } from "path";
import { loadCommands } from "./utils/loadCommands";
import { initDB } from "./utils/data/db";
import { loadEvents } from "./utils/loadEvents";

/**
 * Main bot class that extends the Discord.js Client.
 * Handles command loading, event handling, and bot initialization.
 * @class TsBot
 * @extends {Client} - The Discord.js Client class.
 * @property {Collection<string, Command>} commands - Collection of bot commands.
 * @property {string[]} guildIds - Array of guild IDs for command registration.
 * @constructor - Creates an instance of the TsBot class.
 * @description Initializes the bot, loads commands and events, and registers slash commands.
 * @example
 * const bot = new TsBot();
 * bot.start();
 */
export class TsBot extends Client {
  public commands: Collection<string, Command> = new Collection();
  private guildIds: string[] = [];

  /**
   * Creates an instance of the TsBot class.
   * Initializes the bot with necessary intents and partials.
   */
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
    });
    this.loadEnv();
  }

  /**
   * Loads environment variables from the .env file.
   * Checks for required variables and initializes guild IDs.
   * @private
   * @throws Will throw an error if required environment variables are missing.
   */
  private loadEnv() {
    // Load environment variables from .env file
    // Only load if not already loaded
    if (!process.env.BOT_TOKEN || !process.env.BOT_ID) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("dotenv").config();
    }
    this.guildIds = process.env.GUILD_IDS?.split(",").map(id => id.trim()).filter(Boolean) || [];
    if (!process.env.BOT_TOKEN || !process.env.BOT_ID) {
      console.error(
        "[Main] Missing required environment variables: BOT_TOKEN, BOT_ID\n Please set them in your .env file."
      );
      console.error("Ensure you have a .env file with the following variables:");
      console.error("BOT_TOKEN=<your_bot_token>");
      console.error("BOT_ID=<your_bot_id>");
      process.exit(1);
    }
  }

  /**
   * Starts the bot by initializing the database,
   * loading all commands and events, registering slash commands,
   * and logging in the bot.
   * @public
   * @throws Will throw an error if the bot fails to log in or register commands.
   * @returns {Promise<void>} - A promise that resolves when the bot is ready.
   */
  public async start() {
    await initDB();
    await this.loadAllCommands();
    await this.loadAllEvents();
    await this.registerSlashCommands();
    await this.loginBot();
  }

  /**
   * Loads all commands from the commands directory.
   * Populates the commands collection with Command objects.
   * @private
   * @returns {Promise<void>} - A promise that resolves when all commands are loaded.
   * @throws Will throw an error if command loading fails.
   */
  private async loadAllCommands() {
    const commandPath = join(__dirname, "commands");
    const commandsArr = await loadCommands(commandPath);
    for (const cmd of commandsArr) {
      this.commands.set(cmd.data.name, cmd);
    }
    (this as any).commands = this.commands;
    // Logging
    const grouped: Record<string, string[]> = {};
    for (const cmd of commandsArr) {
      const mainCategory = cmd.category.split("/")[0] || "unknown";
      if (!grouped[mainCategory]) grouped[mainCategory] = [];
      grouped[mainCategory].push(cmd.data.name);
    }
    console.log(
      `[Main] Loaded ${commandsArr.length} commands in ${Object.keys(grouped).length} main categories:`
    );
    for (const [category, cmds] of Object.entries(grouped)) {
      console.log(`  - ${category}: ${cmds.length} commands (${cmds.join(", ")})`);
    }
  }

  /**
   * Loads all events from the events directory.
   * Registers each event with the client.
   * @private
   * @returns {Promise<void>} - A promise that resolves when all events are loaded.
   * @throws Will throw an error if event loading fails.
   */
  private async loadAllEvents() {
    const eventPath = join(__dirname, "events");
    await loadEvents(this, eventPath);
  }

  /**
   * Registers slash commands with Discord's API.
   * Uses REST API to register commands globally or in specified guilds.
   * @private
   * @returns {Promise<void>} - A promise that resolves when commands are registered.
   * @throws Will throw an error if command registration fails.
   */
  private async registerSlashCommands() {
    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);
    const commandDatas = this.commands.map((cmd) => cmd.data.toJSON());
    try {
      console.log("[Main] Started refreshing application (/) commands.");
      if (process.env.NODE_ENV === "production") {
        await rest.put(Routes.applicationCommands(process.env.BOT_ID!), {
          body: commandDatas,
        });
      } else {
        if (!this.guildIds || this.guildIds.length === 0) {
          throw new Error(
            "No GUILD_IDS specified in .env for development mode!"
          );
        }
        console.log(
          `[Main] Refreshing commands in guild mode for guilds: ${this.guildIds.join(", ")}`
        );
        for (const guildId of this.guildIds) {
          await rest.put(
            Routes.applicationGuildCommands(process.env.BOT_ID!, guildId),
            { body: commandDatas }
          );
          console.log(`[Main] Registered commands for guild ${guildId}`);
        }
      }
    } catch (error) {
      console.error("[Main] Error refreshing application commands:", error);
    }
  }

  /**
   * Logs in the bot using the BOT_TOKEN from environment variables.
   * @private
   * @returns {Promise<void>} - A promise that resolves when the bot is logged in.
   * @throws Will throw an error if the bot fails to log in.
   */
  private async loginBot() {
    this.login(process.env.BOT_TOKEN)
      .then(() => console.log("[Main] Bot logged in successfully."))
      .catch((error) => console.error("[Main] Error logging in:", error));
  }
}