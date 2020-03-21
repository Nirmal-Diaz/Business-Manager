import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Module } from "./Module";
import { User } from "./User";

@Index("fk_user_has_module_module1_idx", ["moduleId"], {})
@Entity("userModulePermission", { schema: "d" })
export class UserModulePermission {
  @Column("int", { primary: true, name: "userId" })
  userId: number;

  @Column("int", { primary: true, name: "moduleId" })
  moduleId: number;

  @Column("char", { name: "permissions", length: 4 })
  permissions: string;

  @ManyToOne(
    () => Module,
    module => module.userModulePermissions,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "moduleId", referencedColumnName: "moduleId" }])
  module: Module;

  @ManyToOne(
    () => User,
    user => user.userModulePermissions,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "userId", referencedColumnName: "userId" }])
  user: User;
}
