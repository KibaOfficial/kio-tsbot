// @ts-ignore: Ignore missing export for NewAppDataSource
import { AppDataSource, NewAppDataSource } from "./db";
import { User } from "./entity/User";
import { Shop } from "./entity/Shop";
import { Ship } from "./entity/Ship";
import { ReactionRolePanel } from "./entity/ReactionRolePanel";
import { ReactionRole } from "./entity/ReactionRole";
import { Guild } from "./entity/Guild";
import { config } from "dotenv";

config();

async function migrateEntity<T>(entity: any, name: string) {
  const sqliteRepo = AppDataSource.getRepository(entity);
  const pgRepo = NewAppDataSource.getRepository(entity);
  const all = await sqliteRepo.find();
  if (all.length === 0) {
    console.log(`[${name}] Keine Daten zu migrieren.`);
    return;
  }
  await pgRepo.save(all);
  console.log(`[${name}] ${all.length} Datensätze migriert.`);
}

async function main() {
  await AppDataSource.initialize();
  await NewAppDataSource.initialize();
  console.log("[Migration] Datenbankverbindungen initialisiert.");

  await migrateEntity(User, "User");
  await migrateEntity(Shop, "Shop");
  await migrateEntity(Ship, "Ship");
  await migrateEntity(ReactionRolePanel, "ReactionRolePanel");
  await migrateEntity(ReactionRole, "ReactionRole");
  await migrateEntity(Guild, "Guild");

  await AppDataSource.destroy();
  await NewAppDataSource.destroy();
  console.log("[Migration] Migration abgeschlossen.");
}

main().catch((err) => {
  console.error("[Migration] Fehler:", err);
  process.exit(1);
});
