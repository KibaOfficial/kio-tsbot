// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { promises as fs } from 'fs';
import { join } from 'path';
import { ShipData } from '../../interfaces/shipData';

const dataFile = join(__dirname, 'shipData.json');

export async function loadData(): Promise<ShipData> {
  try {
    const raw = await fs.readFile(dataFile, 'utf-8');
    console.log('[Shipping] Ship data loaded successfully.');
    return JSON.parse(raw) as ShipData;
  } catch (error) {
    return {
      lastPair: null,
      pairsCount: {},
      // history: [],
    }
  }
}

export async function saveData(data: ShipData): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log('[Shipping] Ship data saved successfully.');
}

export function formatPair(p1: string, p2: string) {
  return [p1, p2].sort().join('-');
}

export function incrementPairCpunt(
  data: ShipData,
  p1: string,
  p2: string
) {
  const key = formatPair(p1, p2);
  data.pairsCount[key] = (data.pairsCount[key] || 0) + 1;
}
