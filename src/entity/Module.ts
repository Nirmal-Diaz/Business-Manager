import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserModulePermission } from "./UserModulePermission";

@Entity("module", { schema: "d" })
export class Module {
  @PrimaryGeneratedColumn({ type: "int", name: "moduleId" })
  moduleId: number;

  @Column("varchar", { name: "moduleName", length: 45 })
  moduleName: string;

  @Column("varchar", {
    name: "modulePath",
    length: 100,
    default: () => "'Layouts/Modules/Unknown.html'"
  })
  modulePath: string;

  @OneToMany(
    () => UserModulePermission,
    userModulePermission => userModulePermission.module
  )
  userModulePermissions: UserModulePermission[];
}
