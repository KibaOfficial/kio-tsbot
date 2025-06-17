// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
  ChatInputCommandInteraction,
  MessageFlags
} from "discord.js";
import { ensureInGuild } from "../../../../utils/utils";

/**
 * useNicknameChange function for changing the bot's nickname in a Discord server.
 * This function displays a modal to the user to input a new nickname,
 * changes the bot's nickname to the provided input, and resets it after 1 hour.
 * It also handles errors and ensures the interaction is only processed in a guild context.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from Discord.
 * @returns {Promise<void>} - A promise that resolves when the nickname change is complete.
 * @throws {Error} - Throws an error if the interaction is not in a guild or if the nickname change fails.
 */
export async function useNicknameChange( interaction: ChatInputCommandInteraction ): Promise<void> {
  // Check: In Guild?
  if (!(await ensureInGuild(interaction))) return;

  const modal = new ModalBuilder()
    .setCustomId("nicknamechange-modal")
    .setTitle("Set bot nickname");

  const nicknameInput = new TextInputBuilder()
    .setCustomId("nickname_input")
    .setLabel("Nickname (max 32 chars)")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(32)
    .setRequired(true);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(nicknameInput);
  modal.addComponents(row);

  await interaction.showModal(modal);

  try {
    const submitted = await interaction.awaitModalSubmit({
      filter: (i: ModalSubmitInteraction) =>
        i.customId === "nicknamechange-modal" && i.user.id === interaction.user.id,
      time: 60000
    });

    const newNickname = submitted.fields.getTextInputValue("nickname_input").substring(0, 32);

    await interaction.guild!.members.me?.setNickname(newNickname);

    await submitted.reply({
      content: `✅ Nickname changed to **${newNickname}** for 1 hour.`,
      flags: MessageFlags.Ephemeral
    });

    setTimeout(async () => {
      try {
        await interaction.guild?.members.me?.setNickname(null);
      } catch (error) {
        console.error("[Item] Failed to reset nickname:", error);
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds
  } catch (error) {
    console.error("[Item] Error changing nickname:", error);
    try {
      await interaction.followUp({
        content: "❌ You didn't respond in time or an error occurred.",
        flags: MessageFlags.Ephemeral
      });
    } catch (_) {
      // interaction already replied or deferred
    }
  }
}
