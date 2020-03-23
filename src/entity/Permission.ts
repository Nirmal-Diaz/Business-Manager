import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Module } from "./Module";
import { Role } from "./Role";

@Index("fk_user_has_module_module1_idx", ["moduleId"], {})
@Entity("permission", { schema: "d" })
export class Permission {
  @Column("int", { primary: true, name: "role_id" })
  roleId: number;

  @Column("int", { primary: true, name: "module_id" })
  moduleId: number;

  @Column("char", { name: "value", length: 4 })
  value: string;

  @ManyToOne(
    () => Module,
    module => module.permissions,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => Role,
    role => role.permissions,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Role;
}
