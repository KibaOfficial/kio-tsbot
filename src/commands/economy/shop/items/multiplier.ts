// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction } from "discord.js";
import { checkForItem, getDataAndUser, removeItem, saveData } from "../../data";

/**
 * useMultiplier function for applying a multiplier to the user's economy data.
 * This function checks if the user has a multiplier item in their inventory,
 * applies the multiplier to their balance, and sets an expiration time for the multiplier.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from Discord.
 * @returns {Promise<void>} - A promise that resolves when the multiplier is applied.
 */
export async function useMultiplier(interaction: ChatInputCommandInteraction): Promise<void> {

  // Get: User Data
  const { data, userData, } = await getDataAndUser(interaction.user.id);

  // Check: User has multiplier item
  if (!(await checkForItem(interaction.user.id, "multiplier"))) {
    await interaction.reply({
      content: "You don't have a multiplier item in your inventory.",
      flags: 64 // Ephemeral
    });
    return;
  }

  // Get: Current Time
  const currentTime = Date.now();

  // Check: User already has a multiplier active
  if (userData.multiplierExpiresAt && userData.multiplierExpiresAt > currentTime) {
    const remaining = Math.ceil((userData.multiplierExpiresAt - currentTime) / 1000);
    await interaction.reply({
      content: `You already have a multiplier active! It will expire in ${remaining} seconds.`,
      flags: 64 // Ephemeral
    });
    return;
  }

  // Remove: Multiplier item from user's inventory
  await removeItem(interaction.user.id, "multiplier")

  // Update: User Data multiplierExpiresAt with 3 hours from now
  userData.multiplierExpiresAt = currentTime + 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  // Push: Updated userData into data.users
  data.users[interaction.user.id] = userData;

  // Save: Data
  await saveData(data);
  await interaction.reply({
    content: "✅ Multiplier applied! Your win reward will be multiplied for the next 3 hours.",
    flags: 64 // Ephemeral
  });
}