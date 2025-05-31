import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Guild {
  @PrimaryColumn()
  id!: string; // Discord Guild ID

  @Column({ nullable: true })
  welcomeChannelId?: string;

  @Column({ nullable: true })
  leaveChannelId?: string;
}
