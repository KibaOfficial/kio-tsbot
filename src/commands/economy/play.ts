// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { playSlots } from "./games/slots";
import { Command } from "../../interfaces/types";
import { getDataAndUser } from "./data";

/**
 * Play command for Discord bot.
 * This command allows users to play a game to earn fops 🦊
 * It currently supports a slot machine game.
 * Users can choose a game and specify a bet amount.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the playgame command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 * @throws - If the game is unknown or if the bet amount is invalid.
 */
export const playgame: Command = {
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
  async execute(interaction) {
    const game = interaction.options.getString("game", true);
    const bet = interaction.options.getInteger("bet", true);

    // get user data
    const userId = interaction.user.id;
    const { data, userData } = await getDataAndUser(userId);
    if (!data || !userData) {
      await interaction.reply({
        content: "User data not found. Please try again later.",
        flags: 64 // Ephemeral message
      });
      return;
    }

    // check if user has an active multiplier
    const currentTime = Date.now();
    let activeMultiplier = false;
    if (userData.multiplierExpiresAt && userData.multiplierExpiresAt > currentTime) {
      activeMultiplier = true;
    }

    // Log the multiplier status
    console.log(`[ECO] User has ${activeMultiplier ? "an active multiplier" : "no active multiplier"}.`);

    switch (game) {
      case "slot":
        await playSlots(interaction, bet, activeMultiplier);
        break;
      default:
        await interaction.reply({
          content: "Unknown game. Please choose a valid game.",
          flags: 64 // Ephemeral message
        });
        break;
    }
  }
}