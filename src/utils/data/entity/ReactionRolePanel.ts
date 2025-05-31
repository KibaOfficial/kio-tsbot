// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { ReactionRole } from "./ReactionRole";

@Entity()
export class ReactionRolePanel {
  @PrimaryColumn()
  id: string; // will be generated in the pattern p1, p2, etc.

  @Column()
  guildId: string; // Unique identifier for the guild

  @Column()
  name: string; // Name of the reaction role panel

  @Column()
  description: string; // Description of the reaction role panel

  @Column({ nullable: true })
  messageId?: string; // Optional message ID where the panel is posted

  @Column({ nullable: true })
  channelId?: string; // Optional channel ID where the panel is posted

  @OneToMany(() => ReactionRole, (role) => role.panel, { cascade: true, eager: true })
  roles?: ReactionRole[]; // List of reaction roles associated with this panel

  constructor(id: string, guildId: string, name: string, description: string) {
    this.id = id;
    this.guildId = guildId;
    this.name = name;
    this.description = description;
  }
}