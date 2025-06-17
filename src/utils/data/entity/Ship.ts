// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Entity, PrimaryColumn, Column } from "typeorm";

/**
 * Represents a ship in the guild.
 * This entity is used to track the last pair of users that were matched,
 * as well as the count of how many times each pair has been matched.
 * The `id` is the guild ID, which serves as the primary key for this entity.
 * @Entity
 * @PrimaryGeneratedColumn - The primary key for the ship, which is the guild ID.
 * @Column - The last pair of users that were matched, stored as a simple JSON array.
 * @Column - A record of how many times each pair has been matched, stored as a simple JSON object.
 * @constructor - Initializes the ship with an ID, last pair, and pairs count.
 * @property {string} id - The primary key for the ship, which is the guild ID.
 * @property {Array<string>} lastPair - The last pair of users that were matched, stored as a simple JSON array.
 * @property {Record<string, number>} pairsCount - A record of how many times each pair has been matched, stored as a simple JSON object.
 */
@Entity()
export class Ship {
  @PrimaryColumn({ type: "varchar" })
  id: string; // Primary key for the ship guild.id

  @Column({ type: "simple-json", nullable: true })
  lastPair: [string, string] | null; // The last pair of users that were matched

  @Column({ type: "simple-json", default: "{}" })
  pairsCount: Record<string, number>; // A record of how many times each pair has been matched

  constructor(
    id: string,
    lastPair: [string, string] | null = null,
    pairsCount: Record<string, number> = {}
  ) {
    this.id = id;
    this.lastPair = lastPair;
    this.pairsCount = pairsCount;
  }
}