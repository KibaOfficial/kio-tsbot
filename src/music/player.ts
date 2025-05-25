// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { Client } from "discord.js";

let player: Player | null = null;

export const queueLimit = 25; // Maximum number of songs in the queue

export async function getPlayer(client: Client): Promise<Player> {
  if (!player) {
    player = new Player(client, {});
    await player.extractors.register(YoutubeiExtractor, {});
  }
  return player;
}