// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Item } from "./Item";

/**
 * Shop entity representing a shop in the economy system.
 * It includes properties for the shop's name, description, and an array of items available in the shop.
 * @class Shop
 * @primaryGeneratedColumn - The primary key for the shop, which is an auto-incremented integer.
 * @constructor - Initializes the shop with a name, description, and an array of items.
 * @property {string} name - The name of the shop.
 * @property {string} description - A description of the shop.
 * @property {Item[]} items - An array of items available in the shop, stored as a simple JSON object.
 */
@Entity()
export class Shop {
  @PrimaryGeneratedColumn()
  id!: number; // Primary key for the shop

  @Column ({ type: "varchar", length: 50 })
  name: string; // Name of the shop

  @Column({ type: "varchar", length: 100 })
  description: string; // Description of the shop

  @Column({ type: "simple-json" })
  items: Item[]; // Array of items available in the shop


  constructor(name: string, description: string, items: Item[]) {
    this.name = name;
    this.description = description;
    this.items = items;
  }
}