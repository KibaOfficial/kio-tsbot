// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { GuildTextBasedChannel, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/types";
import { ensureInGuild } from "../../utils/utils";
import { addReactionRole, createPanel, deletePanel, listPanels, removeReactionRole } from "../../services/panelService";
import { ResponseBuilder } from "../../utils/responses";

export const panel: Command = {
  category: "reactionroles",
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Manage reaction roles panels.")
    .addSubcommand(subcommand =>
      subcommand
        .setName("create")
        .setDescription("Create a new reaction roles panel.")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("The channel where the panel will be posted.")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("name")
            .setDescription("The name of the panel.")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("description")
            .setDescription("The description of the panel.")
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("add")
        .setDescription("Add a reaction role to an existing panel.")
        .addStringOption(option => 
          option.setName("panel_id")
            .setDescription("The ID of the panel to which you want to add a reaction role.")
            .setRequired(true))
        .addStringOption(option => 
          option.setName("name")
            .setDescription("The name of the reaction role.")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("description")
            .setDescription("The description of the reaction role.")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("emoji")
            .setDescription("The emoji to use for the reaction role.")
            .setRequired(true))
        .addRoleOption(option =>
          option.setName("role")
            .setDescription("The role to assign when the reaction is added.")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("type")
            .setDescription("Type of reaction role: normal (toggle) or verify (pickup only, removes reaction)")
            .setRequired(true)
            .addChoices(
              { name: "Normal (toggle)", value: "normal" },
              { name: "Verify (pickup only)", value: "verify" }
            )
        )
    )    
    .addSubcommand(subcommand => 
      subcommand
        .setName("delete")
        .setDescription("Delete a whole panel or a single reaction role from a panel.")
        .addStringOption(option =>
          option.setName("choice")
            .setDescription("Delete an entire panel or just a single role?")
            .setRequired(true)
            .addChoices(
              { name: "Delete Panel", value: "panel" },
              { name: "Delete Role", value: "role" }
            )
        )
        .addStringOption(option =>
          option.setName("panel_id")
            .setDescription("The ID of the panel to delete.")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("emoji")
            .setDescription("The emoji of the reaction role to delete (if deleting a role).")
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("List all reaction roles panels.")),
  async execute(interaction) {
    // Check: In Guild?
    if (!await ensureInGuild(interaction)) return;

    let panelId: string | undefined;

    // Handle the subcommands
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "create":
        const name = interaction.options.getString("name", true);
        const description = interaction.options.getString("description", true);
        const channel = interaction.options.getChannel("channel", true);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Ephemeral reply
        // Create the panel
        await createPanel(interaction, name, description, channel as GuildTextBasedChannel);
        // no need to send a reply here, as createPanel already does that
        break;
      case "add":
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Ephemeral reply
        panelId = interaction.options.getString("panel_id", true);
        const roleName = interaction.options.getString("name", true);
        const roleDescription = interaction.options.getString("description", true);
        // Declare 'emoji' only in this block
        let emoji = interaction.options.getString("emoji", true); // Use raw emoji
        // Validate emoji
        if (!emoji) {
          const embed = ResponseBuilder.error(
            "Invalid Emoji",
            "❌ Invalid emoji provided. Please provide a valid emoji.",
            interaction.client
          );
          await interaction.editReply({ embeds: [embed] });
          return;
        }
        // Emoji validation: Unicode or custom
        const customEmojiMatch = emoji.match(/^<a?:\w+:(\d+)>$/);
        if (customEmojiMatch) {
          // Extract custom emoji format for Discord API: name:id or a:name:id
          const animated = emoji.startsWith('<a:');
          const parts = emoji.slice(1, -1).split(":"); // [a?, name, id]
          emoji = `${animated ? "a:" : ""}${parts[1]}:${parts[2]}`;
        } else {
          // Check if it's a valid Unicode emoji (single char or surrogate pair)
          // Unicode emoji regex (basic):
          const unicodeEmojiRegex = /^(\u0000-\u007F|\p{Emoji}|\p{Extended_Pictographic})+$/u;
          if (!unicodeEmojiRegex.test(emoji)) {
            const embed = ResponseBuilder.error(
              "Invalid Emoji Format",
              "❌ Invalid emoji format. Please provide a valid Unicode or custom emoji.",
              interaction.client
            );
            await interaction.editReply({ embeds: [embed] });
            return;
          }
        }
        const role = interaction.options.getRole("role", true);
        const type = (interaction.options.getString("type") as "normal" | "verify") || "normal";
        await addReactionRole(interaction, panelId, roleName, roleDescription, emoji, role.id, type);
        break;
      case "delete":
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Ephemeral reply
        const choice = interaction.options.getString("choice", true);
        panelId = interaction.options.getString("panel_id", true);
        // Declare 'emoji' only in this block
        let emojiDel = interaction.options.getString("emoji", false); // Optional emoji for role deletion
        // Check if deleting a role or the entire panel
        if (choice === "role" && !emojiDel) {
          const embed = ResponseBuilder.error(
            "Missing Emoji",
            "❌ You must provide an emoji to delete a specific role.",
            interaction.client
          );
          await interaction.editReply({ embeds: [embed] });
          return;
        }

        if (choice === "panel") {
          await deletePanel(interaction, panelId);
          return;
        } else if (choice === "role") {
          // Validate emoji
          const customEmojiMatch = emojiDel!.match(/^<a?:\w+:(\d+)>$/);
          if (customEmojiMatch) {
            // Extract custom emoji format for Discord API: name:id or a:name:id
            const animated = emojiDel!.startsWith('<a:');
            const parts = emojiDel!.slice(1, -1).split(":"); // [a?, name, id]
            emojiDel = `${animated ? "a:" : ""}${parts[1]}:${parts[2]}`;
          }
          // Delete a specific reaction role from the panel
          await removeReactionRole(interaction, panelId, emojiDel!);
        }
        break;
      case "list":
        await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Ephemeral reply
        // List all panels
        await listPanels(interaction);
        break;      default:
        const embed = ResponseBuilder.error(
          "Unknown Subcommand",
          "❌ Unknown subcommand. Please use one of the available subcommands.",
          interaction.client
        );
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
    }
  }
}