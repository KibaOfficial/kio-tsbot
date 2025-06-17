// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { 
  SlashCommandBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  ModalSubmitInteraction,
  MessageFlags,
  EmbedBuilder
} from "discord.js";
import { Command } from "../../interfaces/types";
import { ResponseBuilder } from "../../utils/responses";
import * as dotenv from "dotenv";

dotenv.config();

export const feedback: Command = {
  category: 'utils',
  data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription('📝 Send feedback, bug reports, or suggestions to the bot developer'),
  
  async execute(interaction) {
    // Create modal with feedback form
    const modal = new ModalBuilder()
      .setCustomId("feedback-modal")
      .setTitle("📝 Send Feedback to Developer");

    // Feedback type selection (will be handled as text input with options)
    const typeInput = new TextInputBuilder()
      .setCustomId("feedback_type")
      .setLabel("Type (General Feedback, Bug Report, Ideas)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g. Bug Report")
      .setMaxLength(50)
      .setRequired(true);

    // Title/Subject input
    const titleInput = new TextInputBuilder()
      .setCustomId("feedback_title")
      .setLabel("Title/Subject")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Brief title for your feedback...")
      .setMaxLength(100)
      .setRequired(true);

    // Content/Description input
    const contentInput = new TextInputBuilder()
      .setCustomId("feedback_content")
      .setLabel("Content/Description")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Describe your feedback, bug report, or idea in detail...")
      .setMaxLength(2000)
      .setRequired(true);

    // Image URL input (optional for bug reports)
    const imageInput = new TextInputBuilder()
      .setCustomId("feedback_image")
      .setLabel("Image URL (optional - for bug reports)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://imgur.com/example.png (optional)")
      .setMaxLength(500)
      .setRequired(false);

    // Add inputs to action rows
    const typeRow = new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput);
    const titleRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
    const contentRow = new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput);
    const imageRow = new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput);

    modal.addComponents(typeRow, titleRow, contentRow, imageRow);

    // Show modal to user
    await interaction.showModal(modal);

    try {
      // Wait for modal submission
      const submitted = await interaction.awaitModalSubmit({
        filter: (i: ModalSubmitInteraction) =>
          i.customId === "feedback-modal" && i.user.id === interaction.user.id,
        time: 300000 // 5 minutes
      });

      // Extract data from modal
      const feedbackType = submitted.fields.getTextInputValue("feedback_type");
      const feedbackTitle = submitted.fields.getTextInputValue("feedback_title");
      const feedbackContent = submitted.fields.getTextInputValue("feedback_content");
      const feedbackImage = submitted.fields.getTextInputValue("feedback_image") || null;

      // Get bot owner ID from environment
      const botOwnerId = process.env.BOT_OWNER_ID;
      
      if (!botOwnerId) {
        await submitted.reply({
          content: "❌ Bot owner ID not configured. Please contact the developer manually.",
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      // Create embed for bot owner
      const embed = new EmbedBuilder()
        .setTitle(`📝 New ${feedbackType}`)
        .setDescription(feedbackTitle)
        .addFields(
          { name: "📋 Type", value: feedbackType, inline: true },
          { name: "👤 From", value: `[${interaction.user.username}](https://discord.com/users/${interaction.user.id})`, inline: true },
          { name: "🕒 Sent", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: "💬 Content", value: feedbackContent }
        )        
        .setColor(getTypeColor(feedbackType))
        .setFooter({ 
          text: `User ID: ${interaction.user.id} • Kio-TsBot Feedback System`,
          iconURL: interaction.client.user?.displayAvatarURL()
        })
        .setTimestamp();

      // Add image if provided, otherwise use user avatar as thumbnail
      if (feedbackImage && isValidUrl(feedbackImage)) {
        embed.setThumbnail(feedbackImage);
      } else {
        embed.setThumbnail(interaction.user.displayAvatarURL());
      }

      try {
        // Send DM to bot owner
        const owner = await interaction.client.users.fetch(botOwnerId);
        await owner.send({ embeds: [embed] });

        // Confirm to user
        const successEmbed = ResponseBuilder.success(
          "Feedback Sent!",
          `Your **${feedbackType.toLowerCase()}** has been sent to the developer.\n\n` +
          `📋 **Type:** ${feedbackType}\n` +
          `📝 **Title:** ${feedbackTitle}\n\n` +
          `Thank you for your feedback! The developer will review it as soon as possible.`,
          interaction.client
        );

        await submitted.reply({
          embeds: [successEmbed],
          flags: MessageFlags.Ephemeral
        });

        // Log feedback
        console.log(`[FEEDBACK] ${feedbackType} from ${interaction.user.username} (${interaction.user.id}): ${feedbackTitle}`);

      } catch (error) {
        console.error("[FEEDBACK] Error sending feedback to owner:", error);
        
        const errorEmbed = ResponseBuilder.error(
          "Failed to Send Feedback",
          "There was an error sending your feedback. Please try again later or contact the developer directly.",
          interaction.client
        );

        await submitted.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral
        });
      }

    } catch (error) {
      console.error("[FEEDBACK] Modal submission timeout or error:", error);
      // Modal submission timed out or failed - no need to reply as interaction is gone
    }
  }
}

/**
 * Get color based on feedback type
 */
function getTypeColor(type: string): number {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("bug")) return 0xFF0000; // Red for bugs
  if (lowerType.includes("idea")) return 0x00FF00; // Green for ideas
  return 0x0099FF; // Blue for general feedback
}

/**
 * Simple URL validation
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}