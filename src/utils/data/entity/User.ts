// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Entity, PrimaryColumn, Column } from "typeorm";
import { Item } from "./Item";

/**
 * User entity representing a user in the economy system.
 * It includes properties for the user's ID, balance, last daily reward timestamp,
 * inventory of items, and an optional multiplier expiration timestamp.
 * @class User
 * @primaryColumn - The primary key for the user, which is the user ID.
 * @constructor - Initializes the user with an ID, balance, last daily reward timestamp, their inventory, and an optional multiplier expiration timestamp.
 * @property {string} id - The unique identifier for the user.
 * @property {number} balance - The user's balance in the economy system.
 * @property {number} [lastDaily] - The timestamp of the last daily reward claimed by the user, if any.
 * @property {Item[]} inventory - An array of items in the user's inventory, stored as a simple JSON object.
 * @property {number} [multiplierExpiresAt] - The timestamp when the user's multiplier expires, if applicable.
 */
@Entity()
export class User {
  @PrimaryColumn()
  id: string; // User ID
  @Column({ type: "bigint", default: 0, transformer: {
    to: (value: number) => value?.toString(),
    from: (value: string) => Number(value)
  }})
  balance: number; // User's balance

  @Column({ type: "bigint", nullable: true, transformer: {
    to: (value: number | undefined) => value?.toString(),
    from: (value: string | null) => value ? Number(value) : undefined
  }})
  lastDaily?: number; // Timestamp of the last daily reward claimed

  @Column({ type: "simple-json", default: "[]" })
  inventory: Item[]; // Array of items in the user's inventory

  @Column({ type: "bigint", nullable: true, transformer: {
    to: (value: number | undefined) => value?.toString(),
    from: (value: string | null) => value ? Number(value) : undefined
  }})
  multiplierExpiresAt?: number; // Timestamp when the multiplier expires

  constructor(
    id: string,
    balance: number = 0,
    lastDaily?: number,
    inventory: Item[] = [],
    multiplierExpiresAt?: number
  ) {
    this.id = id;
    this.balance = balance;
    this.lastDaily = lastDaily;
    this.inventory = inventory;
    this.multiplierExpiresAt = multiplierExpiresAt;
  }
}