import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 500 })
  tokenHash!: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  revoked!: boolean;

  @Column({ type: 'uuid', nullable: true })
  replacedByTokenId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
