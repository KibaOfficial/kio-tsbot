// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { convertDiscordUserToUser, ensureInGuild, incrementPairCount } from "../../utils/utils";
import { AppDataSource } from "../../utils/data/db";
import { Ship } from "../../utils/data/entity/Ship";
import { ResponseBuilder } from "../../utils/responses";

/**
 * Command to ship two random users in the server.
 * This command selects two random members from the server,
 * increments their ship count in the database,
 * and replies with a message indicating the ship.
 * If there are not enough members to ship, it replies with an error message.
 * @type {Command}
 * @property {SlashCommandBuilder} data - The command data for the slash command.
 * @property {Function} execute - The function to execute when the command is invoked.
 * @returns {Promise<void>} - A promise that resolves when the command is executed.
 * @throws {Error} - If the command is not used in a guild or if there are not enough members to ship.
 */
export const ship: Command = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Ships two random users in the server"),

  async execute(interaction) {
    // Check: In Guild
    if (!(await ensureInGuild(interaction))) return;

    // get shipping data
    const shipRepo = AppDataSource.getRepository(Ship);
    let ship = await shipRepo.findOne({
      where: { id: interaction.guild!.id}
    })

    if (!ship) {
      // If no ship data exists for this guild, create a new one
      ship = new Ship(interaction.guild!.id, undefined, undefined)
      await shipRepo.save(ship);
    }

    // Get all members in the guild
    const allMembers = await interaction.guild!.members.fetch();
    // Filter out bots to only get human members
    const members = allMembers.filter(
      (member) => !member.user.bot
    );

    if (members.size < 2) {
      await interaction.reply({
        content: "Not enough members to ship.",
        flags: MessageFlags.Ephemeral // Ephemeral
      });
      return;
    }

    // Randomly select two different members
    let pair = members.random(2);
    // Ensure the two members are not the same
    // If they are the same, select another member to pair with the first one
    if (pair[0].id === pair[1].id && members.size > 1) {
      pair = members.filter(m => m.id !== pair[0].id).random(1).concat(pair[0]);
    }
    if (pair.length < 2 || pair[0].id === pair[1].id) {
      await interaction.reply({
        content: "Could not find two members to ship.",
        flags: MessageFlags.Ephemeral // Ephemeral
      });
      return;
    }    // convert discord users to user objects
    const user1 = await convertDiscordUserToUser(pair[0].user);
    const user2 = await convertDiscordUserToUser(pair[1].user);
    await incrementPairCount(interaction, user1, user2);

    const embed = ResponseBuilder.shippening(
      "Shipped!",
      `<@${user1.id}> ❤️ <@${user2.id}>`,
      interaction.client
    );

    await interaction.reply({ embeds: [embed] });
  },
};
