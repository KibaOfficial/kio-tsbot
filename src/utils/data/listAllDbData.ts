import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Shop } from "./entity/Shop";
import { Ship } from "./entity/Ship";
import { ReactionRolePanel } from "./entity/ReactionRolePanel";
import { ReactionRole } from "./entity/ReactionRole";
import { Guild } from "./entity/Guild";

// Use a dedicated SQLite DataSource for this script
const SqliteDataSource = new DataSource({
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
async function listAll() {
  await SqliteDataSource.initialize();

  // Helper to print table info
  async function printTable(name: string, repo: any, options: { relations?: string[] } = {}) {
    const count = await repo.count();
    const first = await repo.find({ take: 3, ...(options.relations ? { relations: options.relations } : {}) });
    console.log(`\n--- ${name} ---`);
    console.log(`Count: ${count}`);
    if (count > 0) {
      console.dir(first, { depth: null });
      if (count > 3) console.log(`... (${count - 3} more)`);
    } else {
      console.log("<empty>");
    }
  }

  await printTable("User", SqliteDataSource.getRepository(User));
  await printTable("Shop", SqliteDataSource.getRepository(Shop));
  await printTable("Ship", SqliteDataSource.getRepository(Ship));
  await printTable("ReactionRolePanel", SqliteDataSource.getRepository(ReactionRolePanel), { relations: ["roles"] });
  await printTable("ReactionRole", SqliteDataSource.getRepository(ReactionRole), { relations: ["panel"] });
  await printTable("Guild", SqliteDataSource.getRepository(Guild));

  await SqliteDataSource.destroy();
}

listAll().catch(e => {
  console.error(e);
  process.exit(1);
});
