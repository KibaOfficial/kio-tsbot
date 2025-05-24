// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { promises as fs } from 'fs';
import { join } from 'path';
import { ShipData } from '../../interfaces/shipData';

const dataFile = join(__dirname, 'shipData.json');

const defaultShipData: ShipData = {
  lastPair: null,
  pairsCount: {},
  // history: [],
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}


export async function loadData(): Promise<ShipData> {
  if (!(await fileExists(dataFile))) {
    // Datei existiert nicht → anlegen
    await fs.writeFile(dataFile, JSON.stringify(defaultShipData, null, 2), 'utf-8');
    console.warn('[Shipping] Data file not found. Created new one.');
    return { ...defaultShipData };
  }
  try {
    const raw = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(raw) as ShipData;
  } catch (error) {
    // Datei war da, aber ist kaputt
    console.warn('[Shipping] Data file invalid. Replacing with new one...');
    await fs.writeFile(dataFile, JSON.stringify(defaultShipData, null, 2), 'utf-8');
    return { ...defaultShipData };
  }
}

export async function saveData(data: ShipData): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log('[Shipping] Ship data saved successfully.');
}

export function formatPair(p1: string, p2: string) {
  return [p1, p2].sort().join('-');
}

export function incrementPairCount(
  data: ShipData,
  p1: string,
  p2: string
) {
  const key = formatPair(p1, p2);
  data.pairsCount[key] = (data.pairsCount[key] || 0) + 1;
}