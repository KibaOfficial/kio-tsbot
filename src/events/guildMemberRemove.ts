// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


import { EmbedBuilder } from "discord.js";
import { BotEvent } from "../interfaces/types";
import { AppDataSource } from "../utils/data/db";
import { Guild } from "../utils/data/entity/Guild";

const event: BotEvent<"guildMemberRemove"> = {
  name: "guildMemberRemove",
  once: false,
  async execute(member) {
    const repo = AppDataSource.getRepository(Guild);
    const dbGuild = await repo.findOneBy({ id: member.guild.id });
    if (!dbGuild || !dbGuild.leaveChannelId) return;
    const channel = member.guild.channels.cache.get(dbGuild.leaveChannelId);
    if (!channel || !channel.isTextBased()) return;
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`👋 Member ${member.user.username} has left the server!`)
          .setDescription(`We hope you had a great time with us.\n\nUser: <@${member.user.id}>`)
          .setColor(0xED4245)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: `User ID: ${member.user.id}` })
      ]
    });
  }
}
export default event;