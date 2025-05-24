// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction
} from "discord.js";
import { UserEconomyData } from "../../../../interfaces/econemyData";

// changes the nickname of the bot for 1 hour before resetting it back to the original nickname

export async function useNicknameChange(
  interaction: CommandInteraction,
  userId: string,
  userData: UserEconomyData,
  allUserData: Record<string, UserEconomyData>
) {
  if (!interaction.guild) {
    await interaction.reply({
      content: "❌ This command can only be used in a server.",
      flags: 64
    });
    return;
  }

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

    await interaction.guild.members.me?.setNickname(newNickname);

    await submitted.reply({
      content: `✅ Nickname changed to **${newNickname}** for 1 hour.`,
      flags: 64
    });

    setTimeout(async () => {
      try {
        await interaction.guild?.members.me?.setNickname(null);
      } catch (error) {
        console.error("Failed to reset nickname:", error);
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds
  } catch (error) {
    console.error("Error changing nickname:", error);
    try {
      await interaction.followUp({
        content: "❌ You didn't respond in time or an error occurred.",
        flags: 64
      });
    } catch (_) {
      // interaction already replied or deferred
    }
  }
}
