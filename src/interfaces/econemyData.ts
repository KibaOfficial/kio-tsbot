// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export interface EconomyData {
  users: Record<string, UserEconomyData>;
  shop: Record<string, { price: number; desc: string }>;
}

export interface UserEconomyData {
  balance: number;
  lastDaily?: number;
  inventory: string[];
}

export const defaultUserData: UserEconomyData = {
  balance: 0,
  inventory: []
}

export interface Item {
  name: string;
  description: string;
  price: number;
  type: string;
}

export interface ShopData {
  "shop-items": {
    items: Item[];
  };
}