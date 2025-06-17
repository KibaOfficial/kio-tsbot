// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { Guild } from "../../utils/data/entity/Guild";
import { AppDataSource } from "../../utils/data/db";
import { ensureInGuild } from "../../utils/utils";

export const welcome: Command = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Configure the welcome system for your server.")
    .addSubcommand(subcommand =>
      subcommand
        .setName("channel")
        .setDescription("Set or change the welcome/leave channel for this guild.")
        .addStringOption(option =>
          option.setName("type")
            .setDescription("Choose whether to configure a welcome or leave channel.")
            .setRequired(true)
            .addChoices(
              { name: "Welcome", value: "welcome" },
              { name: "Leave", value: "leave" }
            )
        )
        .addStringOption(option =>
          option.setName("choice")
            .setDescription("Choose whether to create a new channel or edit the existing one.")
            .setRequired(true)
            .addChoices(
              { name: "Create", value: "create" },
              { name: "Edit", value: "edit" }
            )
        )
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("Channel to use.")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const choice = interaction.options.getString("choice");
    const channel = interaction.options.getChannel("channel");

    // Check: Is Guild?
    if (!(await  ensureInGuild(interaction))) return;

    const guildId = interaction.guild!.id

    if (
      !channel ||
      !(
        channel.type === 0 || // GuildText
        channel.type === 5 || // GuildAnnouncement (News)
        channel.type === 11 || // PublicThread
        channel.type === 12 || // PrivateThread
        channel.type === 13    // AnnouncementThread
      )
    ) {
      await interaction.reply({ content: "Please provide a valid text channel.", flags : 64 });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    switch (type) {
      case "welcome":
        switch (choice) {
          case "create":
            try {
              await createWelcome(guildId, channel.id);
              await interaction.editReply({ embeds: [getSuccessEmbed("Welcome channel created successfully!", channel)] });
            } catch (error) {
              await interaction.editReply({ embeds: [getErrorEmbed("Error creating welcome channel", error)] });
            }
            break;
          case "edit":
            try {
              await updateWelcomeChannel(guildId, channel.id);
              await interaction.editReply({ embeds: [getSuccessEmbed("Welcome channel updated!", channel)] });
            } catch (error) {
              await interaction.editReply({ embeds: [getErrorEmbed("Error updating welcome channel", error)] });
            }
            break;
          default:
            await interaction.editReply({ embeds: [getErrorEmbed("Invalid choice. Please select 'create' or 'edit'.", "")] });
            break;
        }
        break;
      case "leave":
        switch (choice) {
          case "create":
            try {
              await createLeave(guildId, channel.id);
              await interaction.editReply({ embeds: [getSuccessEmbed("Leave channel created successfully!", channel)] });
            } catch (error) {
              await interaction.editReply({ embeds: [getErrorEmbed("Error creating leave channel", error)] });
            }
            break;
          case "edit":
            try {
              await updateLeaveChannel(guildId, channel.id);
              await interaction.editReply({ embeds: [getSuccessEmbed("Leave channel updated!", channel)] });
            } catch (error) {
              await interaction.editReply({ embeds: [getErrorEmbed("Error updating leave channel", error)] });
            }
            break;
          default:
            await interaction.editReply({ embeds: [getErrorEmbed("Invalid choice. Please select 'create' or 'edit'.", "")] });
            break;
        }
        break;
      default:
        await interaction.editReply({ embeds: [getErrorEmbed("Invalid type. Please select 'welcome' or 'leave'.", "")] });
        break;
    }
  }
};

function getSuccessEmbed(title: string, channel: any) {
  return {
    title: title,
    description: `Channel: <#${channel.id}>`,
    color: 0x57F287,
    timestamp: new Date().toISOString(),
    footer: { text: "Kio Welcome System" }
  };
}

function getErrorEmbed(title: string, error: any) {
  return {
    title: title,
    description: typeof error === "string" ? error : (error?.message || String(error)),
    color: 0xED4245,
    timestamp: new Date().toISOString(),
    footer: { text: "Kio Welcome System" }
  };
}

async function createWelcome(guildId: string, channelId: string) {
  const guild = await AppDataSource.getRepository(Guild).findOneBy({ id: guildId });
  if (!guild) {
    throw new Error(`Guild with ID ${guildId} not found.`);
  }
  guild.welcomeChannelId = channelId;
  await AppDataSource.getRepository(Guild).save(guild);
  console.log(`[Command.Welcome] Welcome channel set to ${channelId} for guild ${guildId}.`);
}

async function updateWelcomeChannel(guildId: string, channelId: string) {
  const guild = await AppDataSource.getRepository(Guild).findOneBy({ id: guildId });
  if (!guild) {
    throw new Error(`Guild with ID ${guildId} not found.`);
  }
  guild.welcomeChannelId = channelId;
  await AppDataSource.getRepository(Guild).save(guild);
  console.log(`[Command.Welcome] Welcome channel updated to ${channelId} for guild ${guildId}.`);
}

async function createLeave(guildId: string, channelId: string) {
  const repo = AppDataSource.getRepository(Guild);
  const guild = await repo.findOneBy({ id: guildId });
  if (!guild) throw new Error(`Guild with ID ${guildId} not found.`);
  guild.leaveChannelId = channelId;
  await repo.save(guild);
}

async function updateLeaveChannel(guildId: string, channelId: string) {
  const repo = AppDataSource.getRepository(Guild);
  const guild = await repo.findOneBy({ id: guildId });
  if (!guild) throw new Error(`Guild with ID ${guildId} not found.`);
  guild.leaveChannelId = channelId;
  await repo.save(guild);
}