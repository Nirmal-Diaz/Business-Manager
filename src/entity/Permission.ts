import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Module } from "./Module";
import { User } from "./User";

@Index("fk_user_has_module_module1_idx", ["moduleId"], {})
@Entity("permission", { schema: "d" })
export class Permission {
  @Column("int", { primary: true, name: "user_id" })
  userId: number;

  @Column("int", { primary: true, name: "module_id" })
  moduleId: number;

  @Column("char", { name: "permissions", length: 4 })
  permissions: string;

  @ManyToOne(
    () => Module,
    module => module.permissions,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => User,
    user => user.permissions,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
