// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * ShipData interface for managing ship data in a Discord bot.
 * It includes the last paired users, count of pairs, and a history of pairs.
 * @interface ShipData
 * @property {Array<string>} lastPair - The last pair of users that were matched.
 * @property {Record<string, number>} pairsCount - A record of how many times each pair has been matched.
 */
export interface ShipData {
  lastPair: [string, string] | null;
  pairsCount: Record<string, number>;
}