// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { EmbedBuilder, Client } from "discord.js";

/**
 * ResponseBuilder - Centralized response system for consistent bot messaging
 * Provides standardized embed builders for different types of responses
 * with unified branding, colors, and formatting across the entire bot.
 */
export class ResponseBuilder {
  /**
   * Bot branding information
   */
  private static readonly BOT_NAME = "Kio-TsBot";
  private static readonly BOT_EMOJI = "🦊";

  /**
   * Color palette for different response types
   */
  private static readonly COLORS = {
    SUCCESS: 0x57F287,    // Green
    ERROR: 0xED4245,      // Red
    WARNING: 0xFEE75C,    // Yellow
    INFO: 0x5865F2,       // Discord Blurple
    ECONOMY: 0xFFD700,    // Gold
    MUSIC: 0x1DB954,      // Spotify Green
    MODERATION: 0xFF6B6B, // Light Red
    REACTION_ROLE: 0x9B59B6, // Purple
    WELCOME: 0x2ECC71,    // Emerald
    SHIPPENING: 0xFF69B4  // Hot Pink
  } as const;

  /**
   * Gets the bot's avatar URL from client, with fallback
   */
  private static getBotAvatarUrl(client?: Client): string | undefined {
    return client?.user?.displayAvatarURL() || undefined;
  }

  /**
   * Base embed builder with common branding
   */
  private static createBaseEmbed(
    color: number,
    title: string,
    description?: string,
    client?: Client
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setTimestamp()
      .setFooter({ 
        text: this.BOT_NAME,
        iconURL: this.getBotAvatarUrl(client)
      });

    if (description) {
      embed.setDescription(description);
    }

    return embed;
  }

  /**
   * Success response - for successful operations
   */
  static success(title: string, description?: string, client?: Client): EmbedBuilder {
    return this.createBaseEmbed(
      this.COLORS.SUCCESS,
      `✅ ${title}`,
      description,
      client
    );
  }

  /**
   * Error response - for errors and failures
   */
  static error(title: string, description?: string, client?: Client): EmbedBuilder {
    return this.createBaseEmbed(
      this.COLORS.ERROR,
      `❌ ${title}`,
      description,
      client
    );
  }

  /**
   * Warning response - for warnings and cautions
   */
  static warning(title: string, description?: string, client?: Client): EmbedBuilder {
    return this.createBaseEmbed(
      this.COLORS.WARNING,
      `⚠️ ${title}`,
      description,
      client
    );
  }

  /**
   * Info response - for general information
   */
  static info(title: string, description?: string, client?: Client): EmbedBuilder {
    return this.createBaseEmbed(
      this.COLORS.INFO,
      `ℹ️ ${title}`,
      description,
      client
    );
  }

  /**
   * Economy response - for economy-related messages
   */
  static economy(title: string, description?: string, client?: Client): EmbedBuilder {
    const embed = this.createBaseEmbed(
      this.COLORS.ECONOMY,
      `${this.BOT_EMOJI} ${title}`,
      description,
      client
    );
    embed.setFooter({ 
      text: "Kio Economy System",
      iconURL: this.getBotAvatarUrl(client)
    });
    return embed;
  }

  /**
   * Music response - for music-related messages
   */
  static music(title: string, description?: string, client?: Client): EmbedBuilder {
    const embed = this.createBaseEmbed(
      this.COLORS.MUSIC,
      `🎵 ${title}`,
      description,
      client
    );
    embed.setFooter({ 
      text: "Kio Music System",
      iconURL: this.getBotAvatarUrl(client)
    });
    return embed;
  }

  /**
   * Moderation response - for moderation actions
   */
  static moderation(title: string, description?: string, client?: Client): EmbedBuilder {
    const embed = this.createBaseEmbed(
      this.COLORS.MODERATION,
      `🛡️ ${title}`,
      description,
      client
    );
    embed.setFooter({ 
      text: "Kio Moderation System",
      iconURL: this.getBotAvatarUrl(client)
    });
    return embed;
  }

  /**
   * Reaction Role response - for reaction role management
   */
  static reactionRole(title: string, description?: string, client?: Client): EmbedBuilder {
    const embed = this.createBaseEmbed(
      this.COLORS.REACTION_ROLE,
      `🎭 ${title}`,
      description,
      client
    );
    embed.setFooter({ 
      text: "Kio Reaction Role System",
      iconURL: this.getBotAvatarUrl(client)
    });
    return embed;
  }

  /**
   * Welcome response - for welcome/leave messages
   */
  static welcome(title: string, description?: string, client?: Client): EmbedBuilder {
    const embed = this.createBaseEmbed(
      this.COLORS.WELCOME,
      `👋 ${title}`,
      description,
      client
    );
    embed.setFooter({ 
      text: "Kio Welcome System",
      iconURL: this.getBotAvatarUrl(client)
    });
    return embed;
  }

  /**
   * Shippening response - for shipping commands
   */
  static shippening(title: string, description?: string, client?: Client): EmbedBuilder {
    const embed = this.createBaseEmbed(
      this.COLORS.SHIPPENING,
      `🚢 ${title}`,
      description,
      client
    );
    embed.setFooter({ 
      text: "Kio Shippening System",
      iconURL: this.getBotAvatarUrl(client)
    });
    return embed;
  }

  /**
   * Quick response methods for common scenarios
   */
  static quickSuccess(message: string, client?: Client): EmbedBuilder {
    return this.success("Success", message, client);
  }

  static quickError(message: string, client?: Client): EmbedBuilder {
    return this.error("Error", message, client);
  }

  static quickInfo(message: string, client?: Client): EmbedBuilder {
    return this.info("Information", message, client);
  }

  /**
   * No permissions error - commonly used
   */
  static noPermissions(requiredPermission: string, client?: Client): EmbedBuilder {
    return this.error(
      "Insufficient Permissions",
      `You need the **${requiredPermission}** permission to use this command.`,
      client
    );
  }

  /**
   * Command error - for command execution errors
   */
  static commandError(commandName: string, client?: Client): EmbedBuilder {
    return this.error(
      "Command Error",
      `An error occurred while executing the **${commandName}** command. Please try again later.`,
      client
    );
  }

  /**
   * Not in guild error - commonly used
   */
  static notInGuild(client?: Client): EmbedBuilder {
    return this.error(
      "Guild Only Command",
      "This command can only be used in a server, not in DMs.",
      client
    );
  }
}
