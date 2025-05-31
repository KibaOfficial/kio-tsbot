// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  ActivityType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from "discord.js";
import * as dotenv from "dotenv";
import { Command } from "./interfaces/types";
import { join } from "path";
import { loadCommands } from "./utils/loadCommands";
import { initDB } from "./utils/data/db";
import { loadEvents } from "./utils/loadEvents";

// Load environment variables from .env file
dotenv.config();

// Get guild IDs from environment variable, split by comma, and trim whitespace
// This allows the bot to register commands in multiple guilds if needed
const guildIds = process.env.GUILD_IDS?.split(",").map(id => id.trim()).filter(Boolean);

// Check if required environment variables are set
if (
  !process.env.BOT_TOKEN ||
  !process.env.BOT_ID
) {
  console.error(
    "[Main] Missing required environment variables: BOT_TOKEN, BOT_ID\n Please set them in your .env file."
  );
  console.error("Ensure you have a .env file with the following variables:");
  console.error("BOT_TOKEN=<your_bot_token>");
  console.error("BOT_ID=<your_bot_id>");
  process.exit(1);
}

// Set up the Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Enables bot to receive guild (server) events
    GatewayIntentBits.GuildMessages, // Enables bot to receive message events
    GatewayIntentBits.MessageContent, // Enables bot to read message content
    GatewayIntentBits.GuildMembers, // Enables bot to access guild member info
    GatewayIntentBits.GuildVoiceStates, // Enables bot to access voice state events
    GatewayIntentBits.GuildMessageReactions, // Enables bot to receive reaction events
  ],
  partials: [
    Partials.Message, // Allows bot to handle partial messages
    Partials.Channel, // Allows bot to handle partial channels
    Partials.Reaction, // Allows bot to handle partial reactions
    Partials.User, // Allows bot to handle partial users
    Partials.GuildMember, // Allows bot to handle partial guild members
  ]
});

// Create a collection to store commands (name -> Command object)
const commands = new Collection<string, Command>();

/**
 * Loads commands from the specified directory and registers them with Discord's API.
 * Also sets up the event listeners for the bot.
 */
(async () => {
  await initDB();
  // Path to the commands directory
  const commandPath = join(__dirname, 'commands');
  // Load all command modules from the directory
  const commandsArr = await loadCommands(commandPath);
  // Add each command to the collection for easy access by name
  for (const cmd of commandsArr) {
    commands.set(cmd.data.name, cmd);
  }

  // Attach commands collection to client for access in commands like /help
  (client as any).commands = commands;

  // Log the number of commands loaded by category (first directory after /commands)
  const grouped: Record<string, string[]> = {};
  for (const cmd of commandsArr) {
    const mainCategory = cmd.category.split('/')[0] || 'unknown';
    if (!grouped[mainCategory]) grouped[mainCategory] = [];
    grouped[mainCategory].push(cmd.data.name);
  }
  console.log(`[Main] Loaded ${commandsArr.length} commands in ${Object.keys(grouped).length} main categories:`);
  for ( const [category, cmds] of Object.entries(grouped)) {
    console.log(`  - ${category}: ${cmds.length} commands (${cmds.join(', ')})`);
  }

  // load events
  const eventPath = join(__dirname, 'events');
  await loadEvents(client, eventPath);

  // Register commands with Discord's API for slash command support
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

  // Registering commands (global or guild-specific based on environment)
  try {
    console.log('[Main] Started refreshing application (/) commands.');
    const commandDatas = commands.map(cmd => cmd.data.toJSON());
    if (process.env.NODE_ENV === 'production') {
      // Register commands globally in production
      await rest.put(
        Routes.applicationCommands(process.env.BOT_ID!),
        { body: commandDatas },
      );
    } else {
      // Register commands for multiple guilds in development
      if (!guildIds || guildIds.length === 0) {
        throw new Error('No GUILD_IDS specified in .env for development mode!');
      }
      console.log(`[Main] Refreshing commands in guild mode for guilds: ${guildIds.join(', ')}`);
      for (const guildId of guildIds) {
        await rest.put(
          Routes.applicationGuildCommands(process.env.BOT_ID!, guildId),
          { body: commandDatas },
        );
        console.log(`[Main] Registered commands for guild ${guildId}`);
      }
    }
  } catch (error) {
    // Log any errors during command registration
    console.error('[Main] Error refreshing application commands:', error);
  }

  // Log in to Discord with the bot token
  client.login(process.env.BOT_TOKEN)
    .then(() => console.log('[Main] Bot logged in successfully.'))
    .catch(error => console.error('[Main] Error logging in:', error));
})();
