// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Shop } from "./entity/Shop";
import { seedShop } from "./seedShop";
import { Ship } from "./entity/Ship";
import { ReactionRolePanel } from "./entity/ReactionRolePanel";
import { ReactionRole } from "./entity/ReactionRole";
import { Guild } from "./entity/Guild";
import { config } from "dotenv";

config();

/**
 * AppDataSource is the main database connection for the application.
 * It uses PostgreSQL as the database type and connects to the database
 * using the credentials and host information from the environment variables.
 * The `synchronize` option is set to true for development purposes, allowing the database schema to be automatically updated.
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "",
  synchronize: (process.env.NODE_ENV !== "production"), // Synchronize schema only in development
  logging: false,
  entities: [User, Shop, Ship, ReactionRolePanel, ReactionRole, Guild],
  migrations: ["./data/migrations/pg/*{.ts,.js}"],
})

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