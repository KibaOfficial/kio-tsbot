// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { Command } from './types';
import { join } from 'path';
import { readdirSync } from 'fs';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const commands = new Collection<string, Command>();
const commandPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandPath, file);
  const commandModule = require(filePath);
  const command: Command = commandModule.default ?? Object.values(commandModule)[0];
  if (command && command.data && command.data.name) {
    commands.set(command.data.name, command);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    const commandDatas = commands.map(cmd => cmd.data.toJSON());
    if (process.env.NODE_ENV === 'production') {
      await rest.put(
        Routes.applicationCommands(process.env.BOT_ID!),
        { body: commandDatas },
      );
    } else {
      console.log('Refreshing commands in guild mode.');
      await rest.put(
        Routes.applicationGuildCommands(process.env.BOT_ID!, process.env.GUILD_ID!),
        { body: commandDatas },
      );
    }
  } catch (error) {
    console.error('Error refreshing application commands:', error);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

// Command Handler
client.on(Events.InteractionCreate, async interaction => {
  
  if (!interaction.isChatInputCommand()) return;
  
  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    console.log(`Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }    
  }
});

client.login(process.env.BOT_TOKEN)
  .then(() => console.log('Bot logged in successfully.'))