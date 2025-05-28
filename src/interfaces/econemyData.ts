// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * EconomyData interface for managing economy data in a Discord bot.
 * It includes user data, shop items, and their prices and descriptions.
 * @interface EconomyData
 * @property {Record<string, UserEconomyData>} users - A record of user IDs and their economy data.
 * @property {Record<string, { price: number; desc: string }>} shop - A record of shop items with their prices and descriptions.
 */
export interface EconomyData {
  users: Record<string, UserEconomyData>;
  shop: Record<string, { price: number; desc: string }>;
}

/**
 * UserEconomyData interface for managing individual user economy data.
 * It includes the user's balance, last daily reward time, and inventory of items.
 * * @interface UserEconomyData
 * @property {number} balance - The user's current balance in the economy.
 * @property {number} [lastDaily] - The timestamp of the last daily reward claimed by the user (optional).
 * @property {Item[]} inventory - An array of items in the user's inventory.
 */
export interface UserEconomyData {
  balance: number;
  lastDaily?: number;
  inventory: Item[];
}

/**
 * Default user economy data.
 * This is used to initialize a user's economy data when they first join the server.
 * @constant defaultUserData
 * @type {UserEconomyData}  
 * @property {number} balance - The initial balance set to 0.
 * @property {Item[]} inventory - The initial inventory is an empty array.
 */
export const defaultUserData: UserEconomyData = {
  balance: 0,
  inventory: []
}

/**
 * Item interface for defining items in the economy shop.
 * It includes the item's name, description, price, type, emoji, and optional quantity.
 * * @interface Item
 * @property {string} name - The name of the item.
 * @property {string} desc - A description of the item.
 * @property {number} price - The price of the item in the economy.
 * @property {string} itemType - The type of the item (e.g., "weapon", "armor", etc.).
 * @property {string} emoji - An emoji representing the item.
 * @property {number} [quantity] - The quantity of the item available in the shop (optional).
 */
export interface Item {
  name: string;
  desc: string;
  price: number;
  itemType: string;
  emoji: string;
  quantity?: number;
}

/**
 * ShopData interface for managing the shop items in the economy.
 * It includes an array of items available in the shop.
 * * @interface ShopData
 * @property {Object} "shop-items" - An object containing the shop items.
 * @property {Item[]} "shop-items.items" - An array of items available in the shop.
 */
export interface ShopData {
  "shop-items": {
    items: Item[];
  };
}

export interface ShopItemsFile {
  "shop-items": {
    name: string;
    description: string;
    items: Item[];
  };
}