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
  REST,
  Routes,
} from "discord.js";
import * as dotenv from "dotenv";
import { Command } from "./interfaces/types";
import { join } from "path";
import { loadCommands } from "./utils/loadCommands";
import { initDB } from "./utils/data/db";

// Load environment variables from .env file
dotenv.config();

// Check if required environment variables are set
if (
  !process.env.BOT_TOKEN ||
  !process.env.BOT_ID ||
  (process.env.NODE_ENV !== "production" && !process.env.GUILD_ID)
) {
  console.error(
    "[Main] Missing required environment variables: BOT_TOKEN, BOT_ID, or GUILD_ID\n Please set them in your .env file."
  );
  console.error("Ensure you have a .env file with the following variables:");
  console.error("BOT_TOKEN=<your_bot_token>");
  console.error("BOT_ID=<your_bot_id>");
  console.error("GUILD_ID=<your_guild_id> (only needed in development mode)");
  process.exit(1);
}

const statusMessages = [
  { name: "with commands /help", type: ActivityType.Playing }, // playing status
  { name: "over the servers", type: ActivityType.Watching }, // watching status
  { name: "music with /play", type: ActivityType.Listening }, // listening status
  { name: "everything under control", type: ActivityType.Playing }, // playing status
];

// Set up the Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Enables bot to receive guild (server) events
    GatewayIntentBits.GuildMessages, // Enables bot to receive message events
    GatewayIntentBits.MessageContent, // Enables bot to read message content
    GatewayIntentBits.GuildMembers, // Enables bot to access guild member info
    GatewayIntentBits.GuildVoiceStates, // Enables bot to access voice state events
  ],
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
      // Register commands for a specific guild in development
      console.log('[Main] Refreshing commands in guild mode.');
      await rest.put(
        Routes.applicationGuildCommands(process.env.BOT_ID!, process.env.GUILD_ID!),
        { body: commandDatas },
      );
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

// Event: Bot is ready
client.once(Events.ClientReady, () => {
  console.log(`[Main] Logged in as ${client.user?.tag}! at ${new Date().toLocaleString()}`);

  let i = 0;

  const updateStatus = () => {
    const status = statusMessages[i % statusMessages.length];
    client.user?.setActivity(status.name, { type: status.type });
    console.log(`[Main] Status set to: ${status.name}`);
    i++;
  }
  updateStatus();
  setInterval(updateStatus, 0.5 * 60 * 1000); // Update status every 30 seconds
  console.log("[Main] Status updater initialized.");
});

// Event: Handle incoming slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  // Only handle chat input (slash) commands
  if (!interaction.isChatInputCommand()) {
    // Log ignored non-chat input interactions
    console.log(`[Main] Ignored non-chat input interaction from ${interaction.user?.tag || 'unknown user'}`);
    return;
  }
  // Retrieve the command from the collection
  const command = commands.get(interaction.commandName);
  if (!command) {
    // Log unknown command attempts
    console.warn(`[Main] Unknown command: ${interaction.commandName} by ${interaction.user.tag}`);
    return;
  }

  try {
    // Log command execution
    console.log(`[Main] Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
    // Execute the command's logic
    await command.execute(interaction);
    // Log successful execution
    console.log(`[Main] Successfully executed command: ${interaction.commandName} for ${interaction.user.tag}`);
  } catch (error) {
    // Log and reply to errors during command execution
    console.error(`[Main] Error executing command ${interaction.commandName} by ${interaction.user.tag}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', flags: 64 });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
    }
    // Log that the user was notified of the error
    console.log(`[Main] Error message sent to user ${interaction.user.tag} for command ${interaction.commandName}`);
  }
});