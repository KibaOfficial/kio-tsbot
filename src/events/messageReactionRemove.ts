// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Events, MessageReaction, PartialMessageReaction, User, PartialUser } from "discord.js";
import { BotEvent } from "../interfaces/types";
import { AppDataSource } from "../utils/data/db";
import { ReactionRolePanel } from "../utils/data/entity/ReactionRolePanel";

export const event: BotEvent<"messageReactionRemove"> = {
  name: Events.MessageReactionRemove,
  async execute(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ) {
    console.log(`[Event.MessageReactionRemove] Reaction removed by user ${user.id} on message ${reaction.message.id} in guild ${reaction.message.guild?.id} at emoji ${reaction.emoji}.`);
    // Check: is Guild?
    if (!reaction.message.guild) return;

    // Check: is Bot?
    if (user.bot) return;

    // Fetch: if message is partial
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch (error) {
        console.error("[Event.MessageReactionRemove] Could not fetch partial message:", error);
        return;
      }
    }

    // Fetch: reaction if partial
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("[Event.MessageReactionRemove] Could not fetch partial reaction:", error);
        return;
      }
    }

    // Check: if message is a panel message by id
    const panel = await AppDataSource.getRepository(ReactionRolePanel).findOne({
      where: {
        messageId: reaction.message.id,
        guildId: reaction.message.guild.id
      },
      relations: {
        roles: true
      }
    });

    if (!panel) return;

    // Determine the emoji string to match DB (unicode or custom)
    let emojiKey: string;
    if (reaction.emoji.id) {
      // Custom emoji: format as name:id or a:name:id
      emojiKey = `${reaction.emoji.animated ? 'a:' : ''}${reaction.emoji.name}:${reaction.emoji.id}`;
      console.log(`[Event.MessageReactionRemove] Detected custom emoji:`, {
        emojiKey,
        emojiName: reaction.emoji.name,
        emojiId: reaction.emoji.id,
        animated: reaction.emoji.animated
      });
    } else {
      // Unicode emoji: use the character
      emojiKey = reaction.emoji.name!;
      console.log(`[Event.MessageReactionRemove] Detected unicode emoji:`, {
        emojiKey,
        emojiName: reaction.emoji.name
      });
    }

    // Log all panel roles for debugging
    if (panel.roles && panel.roles.length > 0) {
      console.log(`[Event.MessageReactionRemove] Panel roles:`, panel.roles.map(r => ({ name: r.name, emoji: r.emoji, roleId: r.roleId })));
    } else {
      console.log(`[Event.MessageReactionRemove] No roles found for panel.`);
    }

    const reactionRole = panel.roles?.find(role => role.emoji === emojiKey);
    if (!reactionRole) {
      console.log(`[Event.MessageReactionRemove] No matching reaction role found for emojiKey:`, emojiKey);
      return;
    }

    // Remove the role from the user
    const member = await reaction.message.guild.members.fetch(user.id).catch((err) => {
      console.error(`[Event.MessageReactionRemove] Failed to fetch member:`, err);
      return null;
    });
    if (!member) {
      console.log(`[Event.MessageReactionRemove] Member not found for user:`, user.id);
      return;
    }
    if (!member.roles.cache.has(reactionRole.roleId)) {
      // User does not have the role
      console.log(`[Event.MessageReactionRemove] User ${user.id} does not have the role ${reactionRole.roleId}.`);
      return;
    }
    try {
      await member.roles.remove(reactionRole.roleId, `Reaction role panel: ${panel.id}`);
      console.log(`[Event.MessageReactionRemove] User ${user.id} removed reaction ${emojiKey} and lost role ${reactionRole.roleId}.`);
    } catch (err) {
      console.error(`[Event.MessageReactionRemove] Failed to remove role:`, err);
    }
  }
};
