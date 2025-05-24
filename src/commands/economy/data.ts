// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { promises as fs } from 'fs';
import { join } from "path";
import { EconomyData, defaultUserData } from "../../interfaces/econemyData";

const dataFile = join(__dirname, 'economyData.json');

export async function loadData(): Promise<EconomyData> {
  try {
    const raw = await fs.readFile(dataFile, 'utf-8');
    console.log('[ECO] Economy data loaded successfully.');
    return JSON.parse(raw) as EconomyData;
  } catch (error) {
    console.error('[ECO] Error loading economy data:', error);
    return {
      users: {},
      shop: {}
    }
  }
}

export async function saveData(data: EconomyData): Promise<void> {
  try {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[ECO] Economy data saved successfully.');
  } catch (error) {
    console.error('[ECO] Error saving economy data:', error);
  }
}

export async function getUserData(userId: string): Promise<EconomyData['users'][string]> {
  const data = await loadData();
  
  if (!data.users[userId]) {
    data.users[userId] = {...defaultUserData}
    await saveData(data);
  }
  return data.users[userId];
}

export async function getDataAndUser(userId: string): Promise<{ data: EconomyData, userData: EconomyData['users'][string] }> {
  const data = await loadData();

  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }

  return { data, userData: data.users[userId] };
}

export async function getBalance(userId: string): Promise<number> {
  const data = await loadData();
  
  if (!data.users[userId]) {
    data.users[userId] = { ...defaultUserData };
    await saveData(data);
  }

  return data.users[userId].balance;
}

export async function transferMoney(fromId: string, toId: string, amount: number): Promise<void> {
  if (fromId === toId) {
    throw new Error("Cannot transfer money to yourself.");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const data = await loadData();
  
  // check if both users exist if not, create them with default data
  if (!data.users[fromId]) data.users[fromId] = {...defaultUserData}
  if (!data.users[toId]) data.users[toId] = {...defaultUserData}

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