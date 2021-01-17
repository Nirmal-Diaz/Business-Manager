import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MaterialImportOrder } from "./MaterialImportOrder";
import { ProductManufacturingOrder } from "./ProductManufacturingOrder";

@Entity("order_status", { schema: "business_manager" })
export class OrderStatus {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(
    () => MaterialImportOrder,
    (materialImportOrder) => materialImportOrder.orderStatus
  )
  materialImportOrders: MaterialImportOrder[];

  @OneToMany(
    () => ProductManufacturingOrder,
    (productManufacturingOrder) => productManufacturingOrder.orderStatus
  )
  productManufacturingOrders: ProductManufacturingOrder[];
}
