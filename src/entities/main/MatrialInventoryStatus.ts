import { Column, Entity, OneToMany } from "typeorm";
import { MaterialInventory } from "./MaterialInventory";

@Entity("matrial_inventory_status", { schema: "business_manager" })
export class MatrialInventoryStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(
    () => MaterialInventory,
    (materialInventory) => materialInventory.matrialInventoryStatus
  )
  materialInventories: MaterialInventory[];
}
