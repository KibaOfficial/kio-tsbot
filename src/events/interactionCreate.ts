// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Events, ChatInputCommandInteraction, Interaction } from "discord.js";
import { BotEvent } from "../interfaces/types";

export const event: BotEvent<"interactionCreate"> = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) {
      console.log(`[Event.InteractionCreate] Ignored non-command interaction: ${interaction.id}`);
      return;
    }

    // Check: Is Bot?
    if (interaction.user.bot) {
      console.log(`[Event.InteractionCreate] Ignored interaction from bot: ${interaction.user.tag}`);
      return;
    }

    // access for the commands collection at the client
    const commands = (interaction.client as any).commands;
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.log(`[Event.InteractionCreate] Command not found: ${interaction.commandName}`);
      await interaction.reply({
        content: "This command does not exist.",
        flags: 64, // Only the user who invoked the command can see this message
      });
      return;
    }

    try {
      console.log(`[Event.InteractionCreate] Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
      await command.execute(interaction as ChatInputCommandInteraction);
      console.log(`[Event.InteractionCreate] Successfully executed command: ${interaction.commandName} for ${interaction.user.tag}`);
    } catch (error) {
      console.error(`[Event.InteractionCreate] Error executing command ${interaction.commandName} by ${interaction.user.tag}:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: 64 });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
      }
    }
  }
};