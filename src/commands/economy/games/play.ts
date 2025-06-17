// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../interfaces/types";
import { AppDataSource } from "../../../utils/data/db";
import { User } from "../../../utils/data/entity/User";
import { ResponseBuilder } from "../../../utils/responses";
// Games
import { playSlots } from "./slots";
import { playBlackjack } from "./blackjack";
import { playCoinflipSimple } from "./coinflip";
import { playRouletteSimple } from "./roulette";

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
        .setRequired(true)        .addChoices(
          { name: "Slot Machine", value: "slot" },
          { name: "Blackjack", value: "blackjack" },
          { name: "Coinflip", value: "coinflip" },
          { name: "Roulette", value: "roulette" },
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
    console.log(`[ECO] User has ${activeMultiplier ? "an active multiplier" : "no active multiplier"}.`);    switch (game) {
      case "slot":
        await playSlots(interaction, bet, activeMultiplier);
        break;
      case "blackjack":
        await playBlackjack(interaction, bet, activeMultiplier);
        break;      case "coinflip":
        await playCoinflipSimple(interaction, bet, activeMultiplier);
        break;
      case "roulette":
        await playRouletteSimple(interaction, bet, activeMultiplier);
        break;      default:
        const embed = ResponseBuilder.error(
          "Unknown Game",
          "❌ Unknown game. Please choose a valid game from the options.",
          interaction.client
        );
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
        break;
    }
  }
}