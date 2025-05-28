// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { promises as fs } from 'fs';
import { join } from 'path';
import { ShipData } from '../../interfaces/shipData';

const dataFile = join(__dirname, 'shipData.json');

/**
 * Default ship data structure.
 * This is used to initialize the ship data when the file does not exist or is invalid.
 * @constant defaultShipData
 * @type {ShipData}
 * @property {Array<string>} lastPair - The last pair of users that were matched, initialized to null.
 * @property {Record<string, number>} pairsCount - A record of how many times each pair has been matched, initialized to an empty object.
 */
const defaultShipData: ShipData = {
  lastPair: null,
  pairsCount: {},
};

/**
 * Checks if a file exists at the specified path.
 * This function uses the fs.promises.access method to check for file existence.
 * @param filePath - The path to the file to check.
 * @returns {Promise<boolean>} - A promise that resolves to true if the file exists, false otherwise.
 * @throws - If the file does not exist or cannot be accessed, it returns false.
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads the ship data from the JSON file.
 * If the file does not exist, it creates a new file with default data.
 * If the file is invalid, it replaces it with a new file containing default data.
 * @returns {Promise<ShipData>} - A promise that resolves to the ship data loaded from the file.
 * @throws - If the file cannot be read or parsed, it replaces the file with default data and returns it.
 */
export async function loadData(): Promise<ShipData> {
  if (!(await fileExists(dataFile))) {
    await fs.writeFile(dataFile, JSON.stringify(defaultShipData, null, 2), 'utf-8');
    console.warn('[Shipping] Data file not found. Created new one.');
    return { ...defaultShipData };
  }
  try {
    const raw = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(raw) as ShipData;
  } catch (error) {
    console.warn('[Shipping] Data file invalid. Replacing with new one...');
    await fs.writeFile(dataFile, JSON.stringify(defaultShipData, null, 2), 'utf-8');
    return { ...defaultShipData };
  }
}

/**
 * Saves the ship data to the JSON file.
 * This function writes the provided data to the file, overwriting any existing content.
 * @param data - The ship data to save to the file.
 * @returns {Promise<void>} - A promise that resolves when the data has been successfully saved.
 * @throws - If the file cannot be written, it logs an error message to the console.
 */
export async function saveData(data: ShipData): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log('[Shipping] Ship data saved successfully.');
}

/**
 * Formats a pair of user IDs into a string.
 * This function sorts the user IDs and joins them with a hyphen to create a unique identifier for the pair.
 * @param p1 - The first user ID.
 * @param p2 - The second user ID.
 * @returns {string} - A string representing the formatted pair, sorted alphabetically.
 */
export function formatPair(p1: string, p2: string) {
  return [p1, p2].sort().join('-');
}

/**
 * Increments the count of a pair in the ship data.
 * This function updates the pairsCount object in the ship data, incrementing the count for the specified pair.
 * @param data - The ship data object where the pair count will be incremented.
 * @param p1 - The first user ID in the pair.
 * @param p2 - The second user ID in the pair.
 * @returns {void} - This function does not return a value, it modifies the data object directly.
 * @throws - If the data object is invalid or the pair is not formatted correctly, it will still attempt to increment the count.
 */
export function incrementPairCount(
  data: ShipData,
  p1: string,
  p2: string
) {
  const key = formatPair(p1, p2);
  data.pairsCount[key] = (data.pairsCount[key] || 0) + 1;
}