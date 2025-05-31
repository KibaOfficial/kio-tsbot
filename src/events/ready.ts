// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ActivityType } from "discord.js";
import { BotEvent } from "../interfaces/types";


const statusMessages = [
  { name: "with commands /help", type: ActivityType.Playing }, // playing status
  { name: "over the servers", type: ActivityType.Watching }, // watching status
  { name: "music with /play", type: ActivityType.Listening }, // listening status
  { name: "everything under control", type: ActivityType.Playing }, // playing status
];

/**
 * Event handler for the "ready" event.
 * This event is triggered when the bot is ready and logged in.
 * It updates the bot's status periodically with different messages.
 * @type {BotEvent<"ready">}
 * @property {string} name - The name of the event, in this case, "ready".
 * @property {boolean} once - Indicates that this event should only be executed once.
 * @property {function} execute - The function that executes when the event is triggered.
 * @param {import("discord.js").Client} client - The Discord client instance.
 * @return {Promise<void>} - A promise that resolves when the event execution is complete.
 * @throws {Error} - If there is an error while updating the status or logging in.
 */
export const event: BotEvent<"ready"> = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`[Event.Ready] Logged in as ${client.user?.tag}! at ${new Date().toLocaleString()}`);

    let i = 0;

    const updateStatus = () => {
      const status = statusMessages[i % statusMessages.length];
      client.user?.setActivity(status.name, { type: status.type });
      console.log(`[Event.Ready] Status updated to: ${status.name} (${ActivityType[status.type]})`);
      i++;
    }

    updateStatus();
    setInterval(updateStatus, 0.5 * 60 * 1000); // Update status every 30 seconds
    console.log("[Event.Ready] Status updater initialized.");
  }
};