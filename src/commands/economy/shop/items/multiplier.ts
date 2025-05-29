// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction } from "discord.js";
import { AppDataSource } from "../../../../utils/data/db";
import { User } from "../../../../utils/data/entity/User";

/**
 * useMultiplier function for applying a multiplier to the user's economy data.
 * This function checks if the user has a multiplier item in their inventory,
 * applies the multiplier to their balance, and sets an expiration time for the multiplier.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from Discord.
 * @returns {Promise<void>} - A promise that resolves when the multiplier is applied.
 */
export async function useMultiplier(interaction: ChatInputCommandInteraction): Promise<void> {

  // Get: User Data
  const userRepo = AppDataSource.getRepository(User);
  let user = await userRepo.findOne({ where: { id: interaction.user.id } });
  if (!user) {
    // If user does not exist, create a new user with default data
    user = new User(interaction.user.id, 0, undefined, [], undefined);
    await userRepo.save(user);
  }

  // Get: Current Time
  const currentTime = Date.now();

  // Check: User already has a multiplier active
  if (user.multiplierExpiresAt && user.multiplierExpiresAt > currentTime) {
    const remaining = Math.ceil((user.multiplierExpiresAt - currentTime) / 1000);
    await interaction.reply({
      content: `You already have a multiplier active! It will expire in ${remaining} seconds.`,
      flags: 64 // Ephemeral
    });
    return;
  }

  // Update: User Data multiplierExpiresAt with 3 hours from now
  user.multiplierExpiresAt = currentTime + 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  await userRepo.save(user);
  // Log: Multiplier usage
  console.log(`[ECO] Multiplier used by ${interaction.user.id}. Multiplier expires at ${new Date(user.multiplierExpiresAt).toISOString()}`);
  
  await interaction.reply({
    content: "✅ Multiplier applied! Your win reward will be multiplied for the next 3 hours.",
    flags: 64 // Ephemeral
  });
}