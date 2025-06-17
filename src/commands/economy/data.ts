// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { AppDataSource } from "../../utils/data/db";
import { Item } from "../../utils/data/entity/Item";
import { User} from "../../utils/data/entity/User";

/**
 * Transfers money from one user to another.
 * This function checks if the users exist, if the amount is valid,
 * and updates the balances of both users accordingly.
 * @param {User} fromUser - The user from whom money will be transferred.
 * @param {User} toUser - The user to whom money will be transferred.
 * @param {number} amount - The amount of money to transfer.
 * @returns {Promise<void>} - A promise that resolves when the transfer is complete.
 * @throws - If the transfer is invalid (e.g., transferring to oneself, insufficient balance, or invalid amount). 
 */
export async function transferMoney(fromUser: User, toUser: User, amount: number): Promise<void> {
  if (fromUser === toUser) {
    throw new Error("Cannot transfer money to yourself.");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  // Sicherstellen, dass amount ein Integer ist
  const numericAmount = Math.floor(Math.abs(amount));
  
  const fromBalance = Number(fromUser.balance) || 0;
  if (fromBalance < numericAmount) {
    throw new Error("Insufficient balance to transfer money.");
  }

  fromUser.balance = fromBalance - numericAmount;
  toUser.balance = (Number(toUser.balance) || 0) + numericAmount;
  
  const userRepo = AppDataSource.getRepository(User);
  await userRepo.save(fromUser);
  await userRepo.save(toUser);
  console.log(`[ECO] Transferred ${numericAmount} from ${fromUser.id} to ${toUser.id}.`);
}

/**
 * Adds money to a user's balance.
 * This function checks if the user exists, if the amount is valid,
 * and updates the user's balance accordingly.
 * @param {User} user - The user to whom money will be added.
 * @param {number} amount - The amount of money to add to the user's balance.
 * @returns {Promise<void>} - A promise that resolves when the money is added.
 * @throws - If the amount is invalid (e.g., less than or equal to 0).
 * @throws - If the user does not exist, it will create a new user with default data.
 */
export async function addMoney(user: User, amount: number): Promise<void> {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  // Sicherstellen, dass amount ein Integer ist
  const numericAmount = Math.floor(Math.abs(amount));
  
  const userRepo = AppDataSource.getRepository(User);
  let userData = await userRepo.findOne({ where: { id: user.id } });
  if (!userData) {
    // If user does not exist, create a new user with default data
    userData = new User(user.id, 0, undefined, undefined, undefined);
  }
  
  // Safe BigInt arithmetic with overflow protection
  const currentBalance = Number(userData.balance) || 0;
  const maxSafeBalance = Number.MAX_SAFE_INTEGER; // JavaScript's safe integer limit
  const newBalance = currentBalance + numericAmount;
  
  if (newBalance > maxSafeBalance) {
    userData.balance = maxSafeBalance;
    console.log(`[ECO] Balance capped at maximum safe value for ${user.id}`);
  } else {
    userData.balance = newBalance;
  }
  
  await userRepo.save(userData);
  console.log(`[ECO] Added ${numericAmount} to ${user.id}'s balance. New balance: ${userData.balance}`);
}

/**
 * Removes money from a user's balance.
 * This function checks if the user exists, if the amount is valid,
 * and updates the user's balance accordingly.
 * @param {User} user - The user from whose balance money will be removed.
 * @param {number} amount - The amount of money to remove from the user's balance.
 * @returns {Promise<void>} - A promise that resolves when the money is removed.
 * @throws - If the amount is invalid (e.g., less than or equal to 0).
 * @throws - If the user does not exist, it will create a new user with default data.
 */
export async function removeMoney(user: User, amount: number): Promise<void> {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  // Sicherstellen, dass amount ein Integer ist
  const numericAmount = Math.floor(Math.abs(amount));

  const userRepo = AppDataSource.getRepository(User);
  let userData = await userRepo.findOne({ where: { id: user.id } });
  if (!userData) {
    // If user does not exist, create a new user with default data
    userData = new User(user.id, 0, undefined, undefined, undefined);
  }
  
  const currentBalance = Number(userData.balance) || 0;
  
  if (currentBalance < numericAmount) {
    throw new Error("Insufficient balance to remove money.");
  }
  
  userData.balance = currentBalance - numericAmount;
  await userRepo.save(userData);
  console.log(`[ECO] Removed ${numericAmount} from ${user.id}'s balance. New balance: ${userData.balance}`);
}

/**
 * Removes an item from a user's inventory.
 * This function checks if the user exists, if the inventory is available,
 * and if the item exists in the inventory.
 * If the item exists, it decrements the quantity or removes the item if the quantity is 1.
 * @param {string} userId - The ID of the user whose inventory will be modified.
 * @param {string} itemName - The name or itemType of the item to be removed.
 * @return {Promise<void>} - A promise that resolves when the item is removed.
 * @throws - If the user does not exist, it will create a new user with default data.
 * @throws - If the inventory is empty or the item is not found in the inventory.
 */
export async function removeItem(userId: string, itemName: string): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  let userData = await userRepo.findOne({ where: { id: userId } });
  if (!userData) {
    // User initialisieren, falls nicht vorhanden
    userData = new User(userId, 0, undefined, [], undefined);
    await userRepo.save(userData);
    // Da Inventory leer ist, kann das Item nicht entfernt werden
    throw new Error("User inventory is empty.");
  }
  if (!userData.inventory || !Array.isArray(userData.inventory)) {
    userData.inventory = [];
    await userRepo.save(userData);
    throw new Error("User inventory is not available.");
  }
  // Find item by itemType or name (case-insensitive)
  const itemIndex = userData.inventory.findIndex(item =>
    item.itemType.toLowerCase() === itemName.toLowerCase() ||
    item.name.toLowerCase() === itemName.toLowerCase()
  );
  if (itemIndex === -1) {
    // Debug: print inventory for troubleshooting
    console.error("[ECO] Inventory on removeItem fail:", JSON.stringify(userData.inventory, null, 2));
    throw new Error(`Item \"${itemName}\" not found in user's inventory.`);
  }
  // Decrement quantity or remove item
  if (userData.inventory[itemIndex].quantity > 1) {
    userData.inventory[itemIndex].quantity--;
  } else {
    userData.inventory.splice(itemIndex, 1);
  }
  await userRepo.save(userData);
  console.log(`[ECO] Removed item \"${itemName}\" from ${userId}'s inventory.`);
}

/**
 * Checks if a user has a specific item in their inventory.
 * This function retrieves the user's inventory and checks if the specified item exists.
 * @param {User} user - The user whose inventory will be checked.
 * @param {string} item - The name or itemType of the item to check for.
 * @return {Promise<boolean>} - A promise that resolves to true if the item exists in the inventory, false otherwise.
 * @throws - If the user does not exist or if the inventory is not available.
 */
export async function checkForItem(user: User, item: string): Promise<boolean> {
  const userRepo = AppDataSource.getRepository(User);
  const userData = await userRepo.findOne({ where: { id: user.id } });
  
  if (!userData || !userData.inventory || !Array.isArray(userData.inventory)) {
    return false;
  }

  return userData.inventory.some(invItem => invItem.name === item || invItem.itemType === item);
}

/**
 * Adds an item to a user's inventory.
 * This function checks if the user exists, initializes the inventory if necessary,
 * and adds the item to the inventory.
 * If the item already exists, it increments the quantity.
 * @param {string} userId - The ID of the user whose inventory will be modified.
 * @param {Item} item - The item to be added to the user's inventory.
 * @return {Promise<boolean>} - A promise that resolves to true if the item was added successfully.
 * @throws - If the user does not exist, it will create a new user with default data.
 * @throws - If the item is invalid or if the inventory is not available.
 */
export async function addItem(userId: string, item: Item): Promise<boolean> {
  const userRepo = AppDataSource.getRepository(User);
  let userData = await userRepo.findOne({ where: { id: userId } });

  if (!userData) {
    // User initialisieren, falls nicht vorhanden
    userData = new User(userId, 0, undefined, [], undefined);
    await userRepo.save(userData);
    console.log(`[ECO] Created new user ${userData.id} with default data.`);
  }

  // Defensive: ensure inventory is always an array
  if (!Array.isArray(userData.inventory)) {
    userData.inventory = [];
  }

  // Check if the item already exists in the inventory by itemType
  const existingItemIndex = userData.inventory.findIndex(invItem => invItem.itemType === item.itemType);
  if (existingItemIndex !== -1) {
    // If the item already exists, increment its quantity
    if (typeof userData.inventory[existingItemIndex].quantity !== 'number') {
      userData.inventory[existingItemIndex].quantity = 1;
    }
    userData.inventory[existingItemIndex].quantity += 1;
    console.log(`[ECO] Incremented quantity of item \"${item.name}\" for ${userData.id}. New quantity: ${userData.inventory[existingItemIndex].quantity}`);
  } else {
    // If the item does not exist, add it to the inventory (clone the item, set quantity = 1)
    const newItem = {
      name: item.name,
      desc: item.desc,
      price: item.price,
      itemType: item.itemType,
      emoji: item.emoji,
      quantity: 1
    };
    userData.inventory.push(newItem);
    console.log(`[ECO] Added new item \"${item.name}\" to ${userData.id}'s inventory.`);
  }

  await userRepo.save(userData);
  console.log(`[ECO] Inventory for ${userData.id} after add:`, JSON.stringify(userData.inventory));
  return true;
}