// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Events, ChatInputCommandInteraction, Interaction, StringSelectMenuInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { BotEvent, Command } from "../interfaces/types";
import { formatCommandsDescription } from "../utils/utils";
import { ResponseBuilder } from "../utils/responses";

export const event: BotEvent<"interactionCreate"> = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    // Handle help category select menu
    if (interaction.isStringSelectMenu() && interaction.customId === "help_category_select") {
      const client = interaction.client as any;
      const commands = client.commands as Map<string, Command & { category: string }>;
      const selectedCategory = interaction.values[0].toLowerCase(); // normalize
      const cmds = Array.from(commands.values()).filter(cmd => {
        const cat = (cmd.category || "misc").toLowerCase();
        return cat === selectedCategory && cmd.data.name && !cmd.data.name.startsWith("dev-");
      });      
      const description = formatCommandsDescription(cmds);
      const embed = ResponseBuilder.info(
        `✨ Help - ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`,
        `${description}\n\nUse /help to return to the main menu.`,
        interaction.client
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });// Ephemeral
      return;
    }

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
        flags: MessageFlags.Ephemeral, // Only the user who invoked the command can see this message
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
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      }
    }
  }
};