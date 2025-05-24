// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { playSlots } from "./games/slots";

export const playgame = {
  data: new SlashCommandBuilder()
    .setName("playgame")
    .setDescription("Play a game to earn fops 🦊!")
    .addStringOption(option =>
      option.setName("game")
        .setDescription("Choose a game to play")
        .setRequired(true)
        .addChoices(
          { name: "Slot Machine", value: "slot" },
        )
    )
    .addIntegerOption(option =>
      option.setName("bet")
        .setDescription("Amount of fops 🦊 to bet (default: 100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10000)
    ),
  async execute(interaction: CommandInteraction) {
    const game = interaction.options.get("game")?.value as string;
    const bet = interaction.options.get("bet")?.value as number;

    switch (game) {
      case "slot":
        await playSlots(interaction, bet);
        break;
      default:
        await interaction.reply({
          content: "Unknown game. Please choose a valid game.",
          flags: MessageFlags.Ephemeral
        });
        break;
    }
  }
}