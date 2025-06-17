// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { GuildMember } from "discord.js";
import { BotEvent } from "../interfaces/types";
import { AppDataSource } from "../utils/data/db";
import { Guild } from "../utils/data/entity/Guild";
import { ResponseBuilder } from "../utils/responses";

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
    const embed = ResponseBuilder.welcome(
      `👋 Welcome ${member.user.username} to the server!`,
      `We're glad to have you here. Enjoy your stay!\n\n` +
      `User: <@${member.user.id}>\n` +
      `You are member number **${memberCount}** in this server.`,
      member.client
    );
    if (member.user.displayAvatarURL()) {
      embed.setThumbnail(member.user.displayAvatarURL());
    }
    await channel.send({ embeds: [embed] });
  },
};
export default event;
