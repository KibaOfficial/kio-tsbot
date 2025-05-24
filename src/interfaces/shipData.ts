// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export interface ShipData {
  lastPair: [string, string] | null;
  pairsCount: Record<string, number>;
  // history: Array<{ pair: [string, string]; date: string }>;
}