import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Module } from "./Module";

@Entity("module_category", { schema: "business_manager" })
export class ModuleCategory {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @OneToMany(() => Module, (module) => module.moduleCategory)
  modules: Module[];
}
