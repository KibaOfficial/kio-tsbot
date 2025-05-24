// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../types";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and the latency"),
  async execute(interaction: CommandInteraction) {
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
