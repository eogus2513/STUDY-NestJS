import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  uid: number;

  @Column({ length: 15, nullable: false })
  id: string;

  @Column({ length: 60, nullable: false })
  password: string;
}
