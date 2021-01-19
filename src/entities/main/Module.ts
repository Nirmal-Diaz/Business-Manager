import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ModuleCategory } from "./ModuleCategory";
import { Permission } from "./Permission";

@Index("fk_module_module_category1_idx", ["moduleCategoryId"], {})
@Entity("module", { schema: "business_manager" })
export class Module {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("varchar", { name: "layout_file_path", length: 100 })
  layoutFilePath: string;

  @Column("int", { name: "module_category_id" })
  moduleCategoryId: number;

  @Column("varchar", { name: "glance_request_url", nullable: true, length: 45 })
  glanceRequestUrl: string | null;

  @ManyToOne(() => ModuleCategory, (moduleCategory) => moduleCategory.modules, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "module_category_id", referencedColumnName: "id" }])
  moduleCategory: ModuleCategory;

  @OneToMany(() => Permission, (permission) => permission.module)
  permissions: Permission[];
}
