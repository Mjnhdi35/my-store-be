import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_credentials' })
export class UserCredential {
  @PrimaryColumn({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;
}
