// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AppDataSource } from "./db";
import { Item } from "./entity/Item";
import { Shop } from "./entity/Shop";

/**
 * Seeds the shop with initial items.
 * This function checks if the shop already exists in the database.
 * If it does not exist, it creates a new shop with predefined items.
 * If it already exists, it logs a message indicating that the shop is already seeded.
 * @returns {Promise<void>} - A promise that resolves when the shop is seeded.
 * @throws - If there is an error while saving the shop to the database (which should be rare).
 */
export async function seedShop(): Promise<void> {
  const shopRepo = AppDataSource.getRepository(Shop);

  const existing = await shopRepo.findOneBy({ id: 1 })
  if (existing) {
    console.log("[DataBase] Shop already seeded.");
    return;
  }

  const items: Item[] = [
    new Item("Nickname Change", "Change the nickname of the bot in the server for 1 hour.", 1000, "nickname_change", "📝", 1),
    new Item("2x Multiplier", "Double your Fops winnings in games for 3 hours.", 1500, "multiplier", "⏩", 1),
    new Item("Ship booster", "Increases your chance to get shipped in the next shipping", 1200, "ship_boost", "🚢", 1),
    new Item("Love Letter", "Send a highlighted love letter with a custom message.", 500, "love_letter", "💌", 1)
  ]

  const shop = new Shop("Shop Items", "Items available for purchase in the shop.", items);
  await shopRepo.save(shop);
  console.log("[DataBase] Shop seeded successfully.");
}