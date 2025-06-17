// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


import { EmbedBuilder } from "discord.js";
import { BotEvent } from "../interfaces/types";
import { AppDataSource } from "../utils/data/db";
import { Guild } from "../utils/data/entity/Guild";
import { ResponseBuilder } from "../utils/responses";

const event: BotEvent<"guildMemberRemove"> = {
  name: "guildMemberRemove",
  once: false,
  async execute(member) {
    const repo = AppDataSource.getRepository(Guild);
    const dbGuild = await repo.findOneBy({ id: member.guild.id });
    if (!dbGuild || !dbGuild.leaveChannelId) return;
    const channel = member.guild.channels.cache.get(dbGuild.leaveChannelId);
    if (!channel || !channel.isTextBased()) return;
    const embed = ResponseBuilder.welcome(
      `👋 Member ${member.user.username} has left the server!`,
      `We hope you had a great time with us.\n\nUser: <@${member.user.id}>\n\nUser ID: ${member.user.id}`,
      member.client
    ).setColor(0xED4245);
    if (member.user.displayAvatarURL()) {
      embed.setThumbnail(member.user.displayAvatarURL());
    }
    await channel.send({ embeds: [embed] });
  }
}
export default event;