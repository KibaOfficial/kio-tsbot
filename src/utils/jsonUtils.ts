// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fs from "fs";

/**
 * Loads a JSON file from the specified file path.
 * If the file does not exist or cannot be parsed, it returns an empty object.
 * @param filePath - The path to the JSON file to load.
 * @returns - An object containing the parsed JSON data, or an empty object if the file does not exist or is invalid.
 * @throws - If the file cannot be read or parsed, it returns an empty object.
 */
export function loadJson(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

/**
 * Saves data to a JSON file at the specified file path.
 * If the file cannot be written, it logs an error message to the console.
 * @param filePath - The path to the JSON file where data will be saved.
 * @param data - The data to save to the JSON file, which will be stringified.
 * @returns - void
 * @throws - If the file cannot be written, it logs an error message to the console.
 */
export function saveJson(filePath: string, data: any): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`[JsonUtils] Error saving JSON to ${filePath}:`, error);
  }
}