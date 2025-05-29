// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Item entity representing an item in the economy system.
 * It includes properties for the item's name, description, price,
 * type, and an optional emoji.
 * @class Item
 * @primaryColumn - The primary key for the item, which is the itemType.
 * @constructor - Initializes the item with a name, description, price, type, emoji, and quantity.
 * @property {string} name - The name of the item.
 * @property {string} desc - A description of the item.
 * @property {number} price - The price of the item in the economy.
 * @property {string} itemType - The type of the item (e.g., "nickname_change").
 * @property {string} emoji - An optional emoji associated with the item.
 * @property {number} quantity - The quantity of the item available in the shop, default is 0.
 */
@Entity()
export class Item {
  @Column({ type: "varchar", length: 50 })
  name: string; // Name of the item

  @Column({ type: "varchar", length: 100 })
  desc: string; // Description of the item

  @Column({ type: "integer" })
  price: number; // Price of the item in the economy

  @PrimaryColumn()
  @Column({ type: "varchar", length: 50})
  itemType: string; // Type of the item (e.g., "nickname_change" )

  @Column({ type: "string" })
  emoji: string; // Optional emoji associated with the item}

  @Column({ type: "integer", default: 0 })
  quantity: number; // Quantity of the item available in the shop

  constructor(
    name: string,
    desc: string,
    price: number,
    itemType: string,
    emoji: string,
    quantity: number = 0
  ) {
    this.name = name;
    this.desc = desc;
    this.price = price;
    this.itemType = itemType;
    this.emoji = emoji;
    this.quantity = quantity;
  }
}