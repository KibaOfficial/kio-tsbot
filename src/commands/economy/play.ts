// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { playSlots } from "./games/slots";
import { Command } from "../../interfaces/types";
import { AppDataSource } from "../../utils/data/db";
import { User } from "../../utils/data/entity/User";

/**
 * Command to play a game in the economy system.
 * This command allows users to play a game and earn fops 🦊
 * It currently supports a slot machine game.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If the user does not have an active multiplier or if the game is unknown.
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

    // get user from DB
    let user = await AppDataSource.getRepository(User).findOne({
      where: { id: interaction.user.id }
    });
    if (!user) {
      // create user
      const newUser = new User(interaction.user.id, 0, undefined, undefined, undefined);
      await AppDataSource.getRepository(User).save(newUser);
      console.log(`[ECO] Created new user with ID: ${interaction.user.id}`);
      user = newUser;
    }


    // check if user has an active multiplier
    const currentTime = Date.now();
    let activeMultiplier = false;
    if (user.multiplierExpiresAt && user.multiplierExpiresAt > currentTime) {
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