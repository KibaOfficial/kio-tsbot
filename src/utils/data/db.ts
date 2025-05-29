// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Shop } from "./entity/Shop";
import { seedShop } from "./seedShop";
import { Ship } from "./entity/Ship";

/**
 * AppDataSource is the main database connection for the application.
 * It uses SQLite as the database type and connects to a local file `./data/bot.sqlite`.
 * The `synchronize` option is set to true for development purposes, allowing the database schema to be automatically updated.
 */
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./data/bot.sqlite",
  synchronize: true, // TODO: Set to false in production
  logging: false,
  entities: [User, Shop, Ship],
});

/**
 * Initializes the database connection.
 * This function attempts to connect to the database and initializes it.
 * If the connection is successful, it seeds the shop with initial items.
 * If there is an error during initialization, it logs the error and re-throws it for further handling.
 * @returns {Promise<void>} - A promise that resolves when the database is initialized.
 */
export async function initDB(): Promise<void> {
  console.log("[DataBase] 🏗️ Initializing database...");
  try {
    await AppDataSource.initialize();
    console.log("[DataBase] ✅ Database initialized successfully.");
    await seedShop();
  } catch (error) {
    console.error("[DataBase] ❌ Error initializing database:", error);
    throw error; // Re-throw the error to handle it in the calling context
  }
}