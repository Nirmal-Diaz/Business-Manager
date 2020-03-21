import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity("role", { schema: "d" })
export class Role {
  @PrimaryGeneratedColumn({ type: "int", name: "roleId" })
  roleId: number;

  @Column("varchar", { name: "roleName", length: 45 })
  roleName: string;

  @OneToMany(
    () => User,
    user => user.role
  )
  users: User[];
}
