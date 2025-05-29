// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { promises as fs } from 'fs';
import { join } from "path";
import { EconomyData, UserEconomyData, defaultUserData } from "../../interfaces/econemyData";
import { Item } from '../../interfaces/econemyData';

const dataFile = join(__dirname, 'economyData.json');

const defaultEconomyData: EconomyData = {
  users: {}
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads the economy data from the specified JSON file.
 * If the file does not exist, it creates a new one with default data.
 * If the file is invalid, it replaces it with a new one containing default data.
 * @returns {Promise<EconomyData>} - A promise that resolves to the loaded economy data.
 * @throws - If there is an error reading or writing the file, it logs a warning and returns default data.
 */
export async function loadData(): Promise<EconomyData> {
  if (!(await fileExists(dataFile))) {
    await fs.writeFile(dataFile, JSON.stringify(defaultEconomyData, null, 2), 'utf-8');
    console.warn('[ECO] Economy data file not found. Created new one.');
    return { ...defaultEconomyData };
  }
  try {
    const raw = await fs.readFile(dataFile, 'utf-8');
    console.log('[ECO] Economy data loaded successfully.');
    return JSON.parse(raw) as EconomyData;
  } catch (error) {
    console.warn('[ECO] Economy data file invalid. Replacing with new one...');
    await fs.writeFile(dataFile, JSON.stringify(defaultEconomyData, null, 2), 'utf-8');
    return { ...defaultEconomyData };
  }
}

/**
 * Saves the economy data to the specified JSON file.
 * If there is an error writing the file, it logs an error message to the console.
 * @param data - The economy data to save.
 * @returns {Promise<void>} - A promise that resolves when the data is saved.
 * @throws - If there is an error writing the file, it logs an error message to the console.
 */
export async function saveData(data: EconomyData): Promise<void> {
  try {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[ECO] Economy data saved successfully.');
  } catch (error) {
    console.error('[ECO] Error saving economy data:', error);
  }
}

/**
 * Retrieves the economy data for a specific user.
 * If the user does not exist, it creates a new user with default data.
 * This function ensures that the user data is always available.
 * @param {string} userId - The ID of the user whose data is to be retrieved.
 * @returns {Promise<UserEconomyData>} - A promise that resolves to the user's economy data.
 * @throws - If there is an error loading or saving the data, it logs an error message and returns default user data.
 */
export async function getUserData(userId: string): Promise<UserEconomyData> {
  const data = await loadData();
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }
  return data.users[userId];
}

/**
 * Retrieves the economy data and user data for a specific user.
 * If the user does not exist, it creates a new user with default data.
 * This function ensures that both the economy data and user data are always available.
 * @param {string} userId - The ID of the user whose data is to be retrieved.
 * @returns {Promise<{ data: EconomyData, userData: UserEconomyData }>} - A promise that resolves to an object containing the economy data and the user's economy data.
 * @throws - If there is an error loading or saving the data, it logs an error message and returns default user data.
 */
export async function getDataAndUser(userId: string): Promise<{ data: EconomyData, userData: UserEconomyData }> {
  const data = await loadData();
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }
  return { data, userData: data.users[userId] };
}

/**
 * Retrieves the balance of a specific user.
 * If the user does not exist, it creates a new user with default data.
 * This function ensures that the user's balance is always available.
 * @param {string} userId - The ID of the user whose balance is to be retrieved.
 * @returns {Promise<number>} - A promise that resolves to the user's balance.
 * @throws - If there is an error loading or saving the data, it logs an error message and returns 0 as the balance.
 */
export async function getBalance(userId: string): Promise<number> {
  const data = await loadData();
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }
  return data.users[userId].balance;
}

/**
 * Transfers money from one user to another.
 * This function checks if the users exist, if the amount is valid, and if the sender has sufficient balance.
 * It updates both users' balances accordingly.
 * @param {string} fromId - The ID of the user sending the money.
 * @param {string} toId - The ID of the user receiving the money.
 * @param {number} amount - The amount of money to transfer.
 * @returns {Promise<void>} - A promise that resolves when the transfer is complete.
 * @throws - If the transfer is invalid (e.g., transferring to oneself, insufficient balance, or invalid amount).
 */
export async function transferMoney(fromId: string, toId: string, amount: number): Promise<void> {
  if (fromId === toId) {
    throw new Error("Cannot transfer money to yourself.");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const data = await loadData();
  if (!data.users[fromId]) data.users[fromId] = { ...defaultUserData };
  if (!data.users[toId]) data.users[toId] = { ...defaultUserData };

  const fromUser = data.users[fromId];
  const toUser = data.users[toId];

  if (fromUser.balance < amount) {
    throw new Error("Insufficient balance for transfer.");
  }

  fromUser.balance -= amount;
  toUser.balance += amount;

  await saveData(data);
  console.log(`[ECO] Transferred ${amount} from ${fromId} to ${toId}.`);
}

/**
 * Adds money to a user's balance.
 * This function checks if the user exists, if the amount is valid, and updates the user's balance accordingly.
 * @param {string} userId - The ID of the user to whom money will be added.
 * @param {number} amount - The amount of money to add to the user's balance.
 * @returns {Promise<void>} - A promise that resolves when the money is added.
 * @throws - If the amount is invalid (e.g., less than or equal to 0).
 */
export async function addMoney(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const data = await loadData();
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
  }
  data.users[userId].balance += amount;

  await saveData(data);
  console.log(`[ECO] Added ${amount} to ${userId}'s balance.`); 
}

/**
 * Removes money from a user's balance.
 * This function checks if the user exists, if the amount is valid, and if the user has sufficient balance.
 * It updates the user's balance accordingly.
 * @param {string} userId - The ID of the user from whose balance money will be removed.
 * @param {number} amount - The amount of money to remove from the user's balance.
 * @returns {Promise<void>} - A promise that resolves when the money is removed.
 * @throws - If the amount is invalid (e.g., less than or equal to 0) or if there is insufficient balance.
 */
export async function removeMoney(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const data = await loadData();
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
  }
  if (data.users[userId].balance < amount) {
    throw new Error("Insufficient balance to remove money.");
  }
  data.users[userId].balance -= amount;

  await saveData(data);
  console.log(`[ECO] Removed ${amount} from ${userId}'s balance.`);
}

/**
 * Checks if a user has a specific item in their inventory.
 * This function loads the economy data, ensures the user exists, and checks if the item is present in their inventory.
 * It returns true if the item is found, otherwise false.
 * @param userId - The ID of the user to check for the item.
 * @param itemName - The name of the item to check for in the user's inventory.
 * @returns {Promise<boolean>} - A promise that resolves to true if the user has the item, otherwise false.
 * @throws - If there is an error loading or saving the data, it logs an error message and returns false.
 */
export async function checkForItem(userId: string, itemName: string): Promise<boolean> {
  // load the economy data
  const data = await loadData();

  // ensure the user exists in the data if not, create a new user with default data
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }
  
  // check if the user has the item in their inventory
  const userData = data.users[userId];
  const hasItem = userData.inventory.some(item => item.itemType === itemName || item.name.toLowerCase() === itemName.toLowerCase());

  if (hasItem) {
    console.log(`[ECO] User ${userId} has the item: ${itemName}.`);
  } else {
    console.log(`[ECO] User ${userId} does not have the item: ${itemName}.`);
  }
  return hasItem;
}

/**
 * Adds an item to a user's inventory.
 * This function loads the economy data, ensures the user exists, and adds the specified item to their inventory.
 * It saves the updated data after adding the item.
 * @param userId - The ID of the user to whom the item will be added.
 * @param item - The item to add to the user's inventory.
 * @returns {Promise<void>} - A promise that resolves when the item is added.
 * @throws - If there is an error loading or saving the data, it logs an error message.
 */
export async function addItem(userId: string, item: Item): Promise<void> {
  // load the economy data and user data
  const { data, userData } = await getDataAndUser(userId);

  // ensure the user exists in the data if not, create a new user with default data
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }
  // check if the item already exists in the user's inventory

  const existing = userData.inventory.find(i => i.itemType === item.itemType);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    userData.inventory.push({ ...item, quantity: 1 });
  }

  // save the updated data
  await saveData(data);
  console.log(`[ECO] Added item ${item.name} to user ${userId}'s inventory.`);
}

/**
 * Removes an item from a user's inventory.
 * This function loads the economy data, ensures the user exists, and removes the specified item from their inventory.
 * It saves the updated data after removing the item.
 * @param userId - The ID of the user from whose inventory the item will be removed.
 * @param itemName - The name of the item to remove from the user's inventory.
 * @returns {Promise<void>} - A promise that resolves when the item is removed.
 * @throws - If there is an error loading or saving the data, it logs an error message.
 */
export async function removeItem(userId: string, itemName: string): Promise<void> {
  // load the economy data
  const data = await loadData();

  // ensure the user exists in the data if not, create a new user with default data
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }

  // decrement or remove the item from the user's inventory
  const userData = data.users[userId];
  const idx = userData.inventory.findIndex(item => item.itemType === itemName || item.name.toLowerCase() === itemName.toLowerCase());
  if (idx !== -1) {
    if (userData.inventory[idx].quantity && userData.inventory[idx].quantity! > 1) {
      userData.inventory[idx].quantity!--;
    } else {
      userData.inventory.splice(idx, 1);
    }
  }

  // save the updated data
  await saveData(data);
  console.log(`[ECO] Removed item ${itemName} from user ${userId}'s inventory.`);
}