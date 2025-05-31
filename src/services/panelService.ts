// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction, Client, EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { ensurePermissions } from "../utils/utils";
import { ReactionRolePanel } from "../utils/data/entity/ReactionRolePanel";
import { AppDataSource } from "../utils/data/db";
import { ReactionRole } from "../utils/data/entity/ReactionRole";

/**
 * Creates a new reaction role panel in the database.
 * This function checks if the user has the required permissions to create a panel,
 * generates a unique panel ID, and saves the new panel to the database.
 * If the panel creation is successful, it sends a confirmation message to the user.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from the Discord API.
 * @param {string} name - The name of the panel to be created.
 * @param {string} description - The description of the panel to be created.
 * @return {Promise<void>} - A promise that resolves when the panel is created successfully or rejects with an error message.
 * @throws {Error} - If there is an error during the panel creation process, an error message is sent to the user.
 */
export async function createPanel(interaction: ChatInputCommandInteraction, name: string, description: string, channel: GuildTextBasedChannel ): Promise<void> {
  // Check: Permissions
  if (!await ensurePermissions(interaction, ["ManageRoles"])) return;

  const guildId = interaction.guild!.id;
  const panelId = await generatePanelId(guildId);

  // Create: Embed message for the panel
  const embed = new EmbedBuilder()
    .setTitle(name)
    .setDescription(description)
    .setColor("#0099ff")
    .setFooter({ text: `Panel ID: ${panelId}` });

  // Create: message in the specified channel
  const msg = await channel.send({ embeds: [embed] });

  // Create: ReactionRolePanel instance
  const panel = new ReactionRolePanel(panelId, guildId, name, description);
  panel.messageId = msg.id;
  panel.channelId = channel.id;

  // Save: the panel to the database
  try {
    await AppDataSource.getRepository(ReactionRolePanel).save(panel);
    console.log("[PanelService.CreatePanel] Panel created successfully:", panelId);

    // Send: confirmation message to the user
    await interaction.editReply({
      content: `Panel **${name}** created successfully! ID: **${panelId}**`,
    });
  } catch (error) {
    console.error("[PanelService.CreatePanel] Error creating panel:", error);
    await interaction.editReply({
      content: "An error occurred while creating the panel. Please try again later.",
    });
  }  
}

/**
 * Lists all reaction role panels in the guild.
 * This function checks if the user has the required permissions to list panels,
 * fetches all panels from the database for the guild,
 * and sends an embed message containing the list of panels.
 * If no panels are found, it sends a message indicating that there are no panels.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from the Discord API.
 * @returns {Promise<void>} - A promise that resolves when the panels are listed successfully or rejects with an error message.
 * @throws {Error} - If there is an error during the panel listing process, an error message is sent to the user.
 */
export async function listPanels(interaction: ChatInputCommandInteraction) {
  if (!await ensurePermissions(interaction, ["ManageRoles"])) return;

  const guildId = interaction.guild!.id;

  // Fetch: all panels for the guild
  const panels = await AppDataSource.getRepository(ReactionRolePanel).find({
    where: { guildId: guildId },
    relations: ["roles"], // Ensure we load the roles relation
  });

  // Check: if no panels found
  if (panels.length === 0) {
    await interaction.editReply({
      content: "No reaction role panels found in this server.",
    });
    return;
  }

  // Create: embed message for the list of panels
  const embed = new EmbedBuilder()
    .setTitle("Reaction Role Panels")
    .setColor("#0099ff");

  // Add: each panel to the embed
  for (const panel of panels) {
    embed.addFields({
      name: `Panel ID: ${panel.id} - ${panel.name}`,
      value: panel.description || "No description provided",
      inline: false,
    });
  }

  // Send: the embed message
  await interaction.editReply({ embeds: [embed] });
}

/**
 * Updates the message of a reaction role panel.
 * This function fetches the panel from the database using the provided panelId,
 * checks if the panel exists and has a valid messageId and channelId,
 * retrieves the channel and message, and then updates the message with a new embed containing the panel details.
 * If the panel does not exist or if there are any errors during the process, it logs the error and throws an appropriate error message.
 * @param {Client<true>} client - The Discord client instance.
 * @param {string} panelId - The ID of the panel to be updated.
 * @returns {Promise<void>} - A promise that resolves when the panel message is updated successfully or rejects with an error message.
 * @throws {Error} - If there is an error during the panel message update process, an error message is thrown.
 */
export async function updatePanelMessage(client: Client<true>, panelId: string) {
  // Get: ReactionRolePanel from the database with the given panelId
  const panel = await AppDataSource.getRepository(ReactionRolePanel).findOne({
    where: { id: panelId },
    relations: ["roles"], // Ensure we load the roles relation
    select: ["id", "name", "description", "messageId", "channelId", "roles"]
  });

  // Check: If panel exists
  if (!panel) {
    console.error("[PanelService.UpdatePanelMessage] Panel not found:", panelId);
    throw new Error(`Panel with ID ${panelId} not found.`);
  }
  // Check: If messageId and channelId are defined
  if (!panel.messageId || !panel.channelId) {
    console.error("[PanelService.UpdatePanelMessage] Panel messageId or channelId is not defined:", panelId);
    throw new Error(`Panel with ID ${panelId} does not have a messageId or channelId defined.`);
  }

  // Fetch: channel and message 
  let channel: GuildTextBasedChannel;
  try {
    const fetchedChannel = await client.channels.fetch(panel.channelId);
    if (!fetchedChannel || !fetchedChannel.isTextBased()) {
      console.error("[PanelService.UpdatePanelMessage] Channel not found or is not text-based:", panel.channelId);
      throw new Error(`Channel with ID ${panel.channelId} not found or is not a text channel.`);
    }
    channel = fetchedChannel as GuildTextBasedChannel;
  } catch (error: any) {
    console.error("[PanelService.UpdatePanelMessage] Error fetching channel:", error);
    throw new Error(`Error fetching channel with ID ${panel.channelId}: ${error.message}`);
  }

  let message;
  try {
    message = await channel.messages.fetch(panel.messageId);
  } catch (error: any) {
    console.error("[PanelService.UpdatePanelMessage] Error fetching message:", error);
    throw new Error(`Error fetching message with ID ${panel.messageId} in channel ${panel.channelId}: ${error.message}`);
  }

  // Create: Embed for the panel
  const embed = new EmbedBuilder()
    .setTitle(panel.name)
    .setDescription(panel.description)
    .setColor("#0099ff")
    .setFooter({ text: `Panel ID: ${panel.id}` });

  // Add: ReactionRoles to the embed
  if (!panel.roles || panel.roles.length === 0) {
    embed.addFields({ name: "No Reaction Roles", value: "This panel has no reaction roles yet." });
  } else {
    for (const role of panel.roles) {
      embed.addFields({
        name: `${role.emoji} ${role.name}`,
        value: role.description || "No description provided",
        inline: true
      });
    }
  }

  // Edit: the message with the new embed
  try {
    await message.edit({ embeds: [embed], content: '' });
    console.log("[PanelService.UpdatePanelMessage] Panel message updated successfully:", panelId);
  } catch (error: any) {
    console.error("[PanelService.UpdatePanelMessage] Error updating panel message:", error);
    throw new Error(`Error updating panel message with ID ${panel.messageId}: ${error.message}`);
  }
}

/**
 * Deletes a reaction role panel from the database and removes its message from the channel.
 * This function checks if the user has the required permissions to delete a panel,
 * retrieves the panel from the database using the provided panelId,
 * and if the panel exists, it deletes the panel from the database and removes the associated message from the channel.
 * If the panel does not exist or if there are any errors during the process, it sends an error message to the user.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from the Discord API.
 * @param {string} panelId - The ID of the panel to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the panel is deleted successfully or rejects with an error message.
 * @throws {Error} - If there is an error during the panel deletion process, an error message is sent to the user.
 */
export async function deletePanel(interaction: ChatInputCommandInteraction, panelId: string) {
  if (!await ensurePermissions(interaction, ["ManageRoles"])) return;

  const guildId = interaction.guild!.id;

  // Check: if panel exists
  const panel = await AppDataSource.getRepository(ReactionRolePanel).findOne({
    where: { id: panelId, guildId: guildId },
    relations: ["roles"], // Ensure we load the roles relation
  });

  if (!panel) {
    await interaction.editReply({
      content: `Panel with ID **${panelId}** not found.`,
    });
    return;
  }

  // Delete: the panel from the database
  try {
    await AppDataSource.getRepository(ReactionRolePanel).remove(panel);
    console.log("[PanelService.DeletePanel] Panel deleted successfully:", panelId);

    // Delete: the message in the channel
    const channel = interaction.guild!.channels.cache.get(panel.channelId!);
    if (channel && channel.isTextBased()) {
      const message = await channel.messages.fetch(panel.messageId!);
      if (message) {
        await message.delete();
      }
    }

    await interaction.editReply({
      content: `Panel **${panel.name}** deleted successfully!`,
    });
  } catch (error) {
    console.error("[PanelService.DeletePanel] Error deleting panel:", error);
    await interaction.editReply({
      content: "An error occurred while deleting the panel. Please try again later.",
    });
  }
}

/**
 * Adds a reaction role to an existing reaction role panel.
 * This function checks if the user has the required permissions to add a reaction role,
 * retrieves the panel from the database using the provided panelId,
 * and if the panel exists, it creates a new ReactionRole instance with the provided details,
 * saves it to the database, and adds the reaction to the panel message.
 * If the panel does not exist or if there are any errors during the process, it sends an error message to the user.
 * @param {ChatInputCommandInteraction} interaction - The interaction object from the Discord API.
 * @param {string} panelId - The ID of the panel to which the reaction role will be added.
 * @param {string} name - The name of the reaction role to be added.
 * @param {string} description - The description of the reaction role to be added.
 * @param {string} emoji - The emoji to be used for the reaction role.
 * @param {string} roleId - The ID of the role to be assigned when the reaction is added.
 * @return {Promise<void>} - A promise that resolves when the reaction role is added successfully or rejects with an error message.
 * @throws {Error} - If there is an error during the reaction role addition process, an error message is sent to the user.
 */
export async function addReactionRole(
  interaction: ChatInputCommandInteraction,
  panelId: string,
  name: string,
  description: string,
  emoji: string,
  roleId: string
) {
  if (!await ensurePermissions(interaction, ["ManageRoles"])) return;

  // Guild ID is already ensured by the interaction being in a guild
  const guildId = interaction.guild!.id;

  // Check if the panel exists
  const panel = await AppDataSource.getRepository(ReactionRolePanel).findOne({
    where: { id: panelId, guildId: guildId },
    relations: ["roles"], // Ensure we load the roles relation
  });

  // If the panel does not exist, send an error message
  if (!panel) {
    await interaction.editReply({
      content: `Panel with ID **${panelId}** not found.`,
    });
    return;
  }

  // Check: if emoji already exists in the panel
  if (panel.roles?.some(role => role.emoji === emoji)) {
    await interaction.editReply({
      content: `Emoji **${emoji}** is already used in this panel.`,
    });
    return;
  }

  // Create a new ReactionRole instance
  const reactionRole = new ReactionRole(name, description, emoji, roleId, panel);

  // Save the new ReactionRole to the database
  try {
    // Save the reaction role to the database
    await AppDataSource.getRepository(ReactionRole).save(reactionRole);

    // add the reaction to the panel message
    const channel = interaction.guild!.channels.cache.get(panel.channelId!);
    if (channel && channel.isTextBased()) {
      const message = await channel.messages.fetch(panel.messageId!);
      if (message) {
        await message.react(emoji);
      } else {
        console.error("[PanelService.AddReactionRole] Message not found for panel:", panelId);
        await interaction.editReply({
          content: `Panel message not found for ID **${panelId}**.`,
        });
      }
    }

    // Update the panel with the new reaction role
    await updatePanelMessage(interaction.client as Client<true>, panelId);

    await interaction.editReply({
      content: `Reaction role **${name}** added successfully to panel **${panelId}**!`,
    });
  } catch (error) {
    console.error("[PanelService.AddReactionRole] Error adding reaction role:", error);
    await interaction.editReply({
      content: "An error occurred while adding the reaction role. Please try again later.",
    });
    return;
  }
}

export async function removeReactionRole(
  interaction: ChatInputCommandInteraction,
  panelId: string,
  emoji: string
) {
  if (!await ensurePermissions(interaction, ["ManageRoles"])) return;

  // Guild ID is already ensured by the interaction being in a guild
  const guildId = interaction.guild!.id;

  // Check if the panel exists
  const panel = await AppDataSource.getRepository(ReactionRolePanel).findOne({
    where: { id: panelId, guildId: guildId },
    relations: ["roles"], // Ensure we load the roles relation
  });

  // If the panel does not exist, send an error message
  if (!panel) {
    await interaction.editReply({
      content: `Panel with ID **${panelId}** not found.`,
    });
    return;
  }

  // Check: if emoji exists in the panel
  let emojiKey: string;
  const customEmojiMatch = emoji.match(/^<a?:\w+:\d+>$/);
  if (customEmojiMatch) {
    const animated = customEmojiMatch[0].startsWith("<a:");
    const parts = emoji.slice(1, -1).split(":"); // [a?, name, id]
    emojiKey = `${animated ? 'a:' : ''}${parts[1]}:${parts[2]}`;
  } else {
    // Unicode emoji: use the character
    emojiKey = emoji;
  }

  const reactionRole = panel.roles?.find(role => role.emoji === emojiKey);
  if (!reactionRole) {
    await interaction.editReply({
      content: `Emoji **${emoji}** not found in panel **${panelId}**.`,
    });
    return;
  }

  // Remove the reaction role from the database
  try {
    await AppDataSource.getRepository(ReactionRole).remove(reactionRole);

    const channel = interaction.guild!.channels.cache.get(panel.channelId!);
    if (channel && channel.isTextBased()) {
      const message = await channel.messages.fetch(panel.messageId!);
      if (message) {
        const reactionObj = message.reactions.cache.find(
          reaction => (reaction.emoji.id
            ? `${reaction.emoji.animated ? 'a:' : ''}${reaction.emoji.name}:${reaction.emoji.id}`
            : reaction.emoji.name) === emojiKey
          )
        if (reactionObj) await reactionObj.remove();
      }
    }

    // Update the panel message to reflect the changes
    await updatePanelMessage(interaction.client as Client<true>, panelId);
    await interaction.editReply({
      content: `Reaction role with emoji **${emoji}** removed successfully from panel **${panelId}**!`,
    });
  } catch (error) {
    console.error("[PanelService.RemoveReactionRole] Error removing reaction role:", error);
    await interaction.editReply({
      content: "An error occurred while removing the reaction role. Please try again later.",
    });
    return;
  }
}


/**
 * Generates a unique panel ID for a ReactionRolePanel.
 * This function retrieves all existing panels from the database, finds the maximum ID, and increments it to create a new unique ID.
 * If there are no existing panels, it starts from `p1`.
 * @param {string} guildId - The ID of the guild for which the panel ID is being generated.
 * @returns {Promise<string>} - A promise that resolves to the new unique panel ID.
 * @throws - If there is an error retrieving the panels from the database.
 */
export async function generatePanelId(guildId: string) {
  const panels = await AppDataSource.getRepository(ReactionRolePanel).find({
    where: { guildId: guildId }
  });
  const maxId = panels
    .map(panel => parseInt(panel.id.slice(1)))
    .filter(id => !isNaN(id))
    .sort((a, b) => b - a)[0] || 0;
  return `p${maxId + 1}`;
}