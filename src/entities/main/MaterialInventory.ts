import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { Material } from "./Material";
import { MatrialInventoryStatus } from "./MatrialInventoryStatus";

@Index(
  "fk_material_inventory_matrial_inventory_status1_idx",
  ["matrialInventoryStatusId"],
  {}
)
@Entity("material_inventory", { schema: "business_manager" })
export class MaterialInventory {
  @Column("int", { primary: true, name: "material_id" })
  materialId: number;

  @Column("decimal", { name: "available_amount", precision: 7, scale: 2 })
  availableAmount: string;

  @Column("int", { name: "matrial_inventory_status_id" })
  matrialInventoryStatusId: number;

  @OneToOne(() => Material, (material) => material.materialInventory, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "material_id", referencedColumnName: "id" }])
  material: Material;

  @ManyToOne(
    () => MatrialInventoryStatus,
    (matrialInventoryStatus) => matrialInventoryStatus.materialInventories,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([
    { name: "matrial_inventory_status_id", referencedColumnName: "id" },
  ])
  matrialInventoryStatus: MatrialInventoryStatus;
}
