import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { UserPreference } from "./UserPreference";
import { Permission } from "./Permission";
import { Role } from "./Role";

@Index("username_UNIQUE", ["username"], { unique: true })
@Index("fk_user_occupation1_idx", ["roleId"], {})
@Entity("user", { schema: "d" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "username", unique: true, length: 45 })
  username: string;

  @Column("char", { name: "hash", length: 64 })
  hash: string;

  @Column("blob", { name: "avatar", nullable: true })
  avatar: Buffer | null;

  @Column("int", { name: "role_id" })
  roleId: number;

  @Column("tinyint", { name: "new_user" })
  newUser: number;

  @OneToOne(
    () => UserPreference,
    userPreference => userPreference.user
  )
  userPreference: UserPreference;

  @OneToMany(
    () => Permission,
    permission => permission.user
  )
  permissions: Permission[];

  @ManyToOne(
    () => Role,
    role => role.users,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Role;
}
