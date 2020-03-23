import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./Permission";

@Entity("module", { schema: "d" })
export class Module {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("varchar", { name: "layout_file_path", length: 100 })
  layoutFilePath: string;

  @OneToMany(
    () => Permission,
    permission => permission.module
  )
  permissions: Permission[];
}
