// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ReactionRolePanel } from "./ReactionRolePanel";

@Entity()
export class ReactionRole {
  @PrimaryColumn()
  roleId: string; // Unique identifier for the reaction role
  
  @Column()
  name: string; // Name of the reaction role

  @Column()
  description: string; // Optional description of the reaction role

  @Column()
  emoji: string; // Emoji used for the reaction

  @Column({ default: "normal" })
  type: "normal" | "verify"; // Type of reaction role: normal (toggle) or verify (pickup only)

  @ManyToOne(() => ReactionRolePanel, panel => panel.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panelId' })
  panel: ReactionRolePanel;

  constructor(name: string, description: string, emoji: string, roleId: string, panel: ReactionRolePanel, type: "normal" | "verify" = "normal") {
    this.name = name;
    this.description = description;
    this.emoji = emoji;
    this.roleId = roleId;
    this.panel = panel;
    this.type = type;
  }
}