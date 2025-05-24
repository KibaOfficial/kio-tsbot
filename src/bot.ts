// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { Command } from './interfaces/types';
import { join } from 'path';
import { loadCommands } from './utils/loadCommands';

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

(async () => {
  const commandPath = join(__dirname, 'commands');
  const commandsArr = await loadCommands(commandPath);
  for (const cmd of commandsArr) {
    commands.set(cmd.data.name, cmd);
  }

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

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

  client.login(process.env.BOT_TOKEN)
    .then(() => console.log('Bot logged in successfully.'));
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