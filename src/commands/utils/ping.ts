// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";

/**
 * Ping command for Discord bot.
 * This command replies with the latency of the bot and the API.
 * It measures the time taken to respond to the command and the WebSocket ping.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the ping command.
 * @property {function} execute - The function that executes the command when invoked.
 * @returns {Promise<void>} - A promise that resolves when the command execution is complete.
 */
export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and the latency"),
  async execute(interaction) {
    const start = Date.now();
    await interaction.deferReply();
    const latency = Date.now() - start;
    const apiLatency =
      interaction.client.ws.ping >= 0
        ? `${Math.round(interaction.client.ws.ping)}ms`
        : "unavailable";

    await interaction.editReply(
      `🏓 Latency is ${latency}ms. API Latency is ${apiLatency}`
    );
  },
};
