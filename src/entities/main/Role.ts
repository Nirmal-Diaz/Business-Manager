import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./Permission";
import { User } from "./User";

@Entity("role", { schema: "business_manager" })
export class Role {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(() => Permission, (permission) => permission.role)
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
