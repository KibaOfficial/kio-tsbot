// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EmbedBuilder, GuildMember } from "discord.js";
import { BotEvent } from "../interfaces/types";
import { AppDataSource } from "../utils/data/db";
import { Guild } from "../utils/data/entity/Guild";

const event: BotEvent<"guildMemberAdd"> = {
  name: "guildMemberAdd",
  once: false,
  async execute(member: GuildMember) {
    const repo = AppDataSource.getRepository(Guild);
    const dbGuild = await repo.findOneBy({ id: member.guild.id });
    if (!dbGuild || !dbGuild.welcomeChannelId) return;
    const channel = member.guild.channels.cache.get(dbGuild.welcomeChannelId);
    if (!channel || !channel.isTextBased()) return;
    // Get: guild member number
    const memberCount = member.guild.memberCount;
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`👋 Welcome ${member.user.username} to the server!`)
          .setDescription(
            `
            We're glad to have you here. Enjoy your stay!\n\n
            User: <@${member.user.id}> \n
            You are member number **${memberCount}** in this server.
            `
          )
          .setColor(0x00ff00)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp()
      ],
    });
  },
};
export default event;
