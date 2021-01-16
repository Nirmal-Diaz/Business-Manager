import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MaterialImportOrder } from "./MaterialImportOrder";
import { ProductExportOrder } from "./ProductExportOrder";

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
    () => ProductExportOrder,
    (productExportOrder) => productExportOrder.orderStatus
  )
  productExportOrders: ProductExportOrder[];
}
