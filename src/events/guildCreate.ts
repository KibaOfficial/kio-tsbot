import { Events, Guild as DiscordGuild } from "discord.js";
import { AppDataSource } from "../utils/data/db";
import { Guild } from "../utils/data/entity/Guild";
import { BotEvent } from "../interfaces/types";

export const event: BotEvent<"guildCreate"> = {
  name: Events.GuildCreate,
  async execute(guild: DiscordGuild) {
    const repo = AppDataSource.getRepository(Guild);
    let dbGuild = await repo.findOneBy({ id: guild.id });
    if (!dbGuild) {
      dbGuild = repo.create({ id: guild.id });
      await repo.save(dbGuild);
      console.log(`[GuildCreate] Registered new guild in DB: ${guild.id} (${guild.name})`);
    } else {
      console.log(`[GuildCreate] Guild already exists in DB: ${guild.id} (${guild.name})`);
    }
  }
};
