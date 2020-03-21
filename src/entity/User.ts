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
import { UserModulePermission } from "./UserModulePermission";
import { Role } from "./Role";

@Index("fk_user_occupation1_idx", ["roleId"], {})
@Entity("user", { schema: "d" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "userId" })
  userId: number;

  @Column("varchar", { name: "username", length: 45 })
  username: string;

  @Column("char", { name: "hash", length: 64 })
  hash: string;

  @Column("blob", { name: "profileImage", nullable: true })
  profileImage: Buffer | null;

  @Column("int", { name: "roleId" })
  roleId: number;

  @Column("tinyint", { name: "isNewUser" })
  isNewUser: number;

  @OneToOne(
    () => UserPreference,
    userPreference => userPreference.user
  )
  userPreference: UserPreference;

  @OneToMany(
    () => UserModulePermission,
    userModulePermission => userModulePermission.user
  )
  userModulePermissions: UserModulePermission[];

  @ManyToOne(
    () => Role,
    role => role.users,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION"}
  )
  @JoinColumn([{ name: "roleId", referencedColumnName: "roleId" }])
  role: Role;
}
