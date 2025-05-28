// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { Client } from "discord.js";
import playdl from "play-dl";
import { BaseExtractor, ExtractorExecutionContext } from "discord-player";

/**
 * PlaydlExtractor is a custom extractor for the discord-player library.
 * It uses the play-dl library to extract video information from YouTube URLs.
 * It validates the URL and extracts details such as title, URL, duration, and thumbnail.
 * This extractor is registered with the Player instance to handle YouTube video extraction.
 * @class PlaydlExtractor
 * @extends BaseExtractor
 * @param {ExtractorExecutionContext} context - The execution context for the extractor.
 * @param {object} options - Options for the extractor.
 * @returns {Promise<any>} - Returns a promise that resolves to an object containing video details.
 * @throws {Error} - Throws an error if the URL is invalid or if extraction fails.
 */
class PlaydlExtractor extends BaseExtractor {
  static identifier = "playdl";
  constructor(context: ExtractorExecutionContext, options: object) {
    super(context, options);
  }
  async validate(url: string): Promise<boolean> {
    return playdl.yt_validate(url) !== false;
  }
  async extract(url: string): Promise<any> {
    const video = await playdl.video_info(url);
    return {
      title: video.video_details.title,
      url: video.video_details.url,
      duration: video.video_details.durationInSec,
      thumbnail: video.video_details.thumbnails[0].url,
    };
  }
}

let player: Player | null = null;

/**
 * The maximum number of songs that can be queued in the music player.
 * This limit helps manage the queue size and prevents performance issues.
 */
export const queueLimit = 25; // Maximum number of songs in the queue

/**
 * Initializes and returns a Player instance with registered extractors.
 * This function ensures that the player is only created once and reuses the existing instance if available.
 * @param client - The Discord client instance.
 * @returns - A Player instance with registered extractors.
 * @throws - If the player cannot be initialized or extractors cannot be registered.
 */
export async function getPlayer(client: Client): Promise<Player> {
  if (!player) {
    player = new Player(client, {});
    await player.extractors.register(YoutubeiExtractor, {});
    await player.extractors.register(PlaydlExtractor, {
      youtube: {
        noRequire: true,
        noCache: true,
      },
    });
  }
  return player;
}