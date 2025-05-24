// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../../interfaces/types";
import { incrementPairCount, loadData, saveData } from "./data";

export const ship: Command = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Ships two random users in the server"),

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    await interaction.guild.members.fetch();
    const members = interaction.guild.members.cache
      .filter((m) => !m.user.bot)
      .map((m) => m.user);

    if (members.length < 2) {
      await interaction.reply(
        "Not enough users to ship. At least 2 users are required."
      );
      return;
    }

    const shuffled = members.sort(() => 0.5 - Math.random());
    const pair = shuffled.slice(0, 2);

    const data = await loadData();

    // check if 24h have passed since the last pair was shipped
    if (data.lastPair && data.lastPair[0] === pair[0].id && data.lastPair[1] === pair[1].id) {
      await interaction.reply("This pair has already been shipped recently. Please try again later.");
      return;
    }

    incrementPairCount(data, pair[0].id, pair[1].id);
    data.lastPair = [pair[0].id, pair[1].id];

    await saveData(data);

    await interaction.reply(
      ` **Shipped!**\n\n<@${pair[0].id}> ❤️ <@${pair[1].id}>\n\n`
    );
  },
};
