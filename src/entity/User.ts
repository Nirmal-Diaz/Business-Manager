import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { UserPreference } from "./UserPreference";
import { Role } from "./Role";

@Index("fk_user_occupation1_idx", ["roleId"], {})
@Index("username_UNIQUE", ["username"], { unique: true })
@Entity("user", { schema: "d" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "username", unique: true, length: 45 })
  username: string;

  @Column("tinyint", { name: "new_user", default: () => "'1'" })
  newUser: number;

  @Column("int", { name: "role_id" })
  roleId: number;

  @OneToOne(
    () => UserPreference,
    userPreference => userPreference.user
  )
  userPreference: UserPreference;

  @ManyToOne(
    () => Role,
    role => role.users,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Role;
}
