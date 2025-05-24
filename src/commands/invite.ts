// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Command } from "../types";

export const invite: Command = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Replies with the bot's invite link"),
  async execute(interaction: CommandInteraction) {
    const clientId = process.env.BOT_ID;
    if (!clientId) {
      console.log
      interaction.reply("Bot ID is not set in the environment variables.");
      return;
    }

    const permissions = 274877906944; // Administrator-Permissions
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
    await interaction.reply({
      content: `You can invite me using this link: [Invite Link](${inviteUrl})`,
      ephemeral: true,
    });
    console.log(`Invite link sent: ${inviteUrl}\nRequested by: ${interaction.user.tag} (${interaction.user.id})`);
  }
}