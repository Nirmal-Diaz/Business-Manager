import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductManufacturingInvoice } from "./ProductManufacturingInvoice";
import { OrderStatus } from "./OrderStatus";
import { UnitType } from "./UnitType";
import { Product } from "./Product";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_import_order_order_status1_idx", ["orderStatusId"], {})
@Index("fk_material_import_order_unit_type1_idx", ["unitTypeId"], {})
@Index("fk_product_export_order_product1_idx", ["productId"], {})
@Entity("product_manufacturing_order", { schema: "business_manager" })
export class ProductManufacturingOrder {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("int", { name: "product_id" })
  productId: number;

  @Column("decimal", { name: "requested_amount", precision: 10, scale: 2 })
  requestedAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("date", { name: "wanted_by" })
  wantedBy: string;

  @Column("int", { name: "order_status_id" })
  orderStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToOne(
    () => ProductManufacturingInvoice,
    (productManufacturingInvoice) => productManufacturingInvoice.orderCode2
  )
  productManufacturingInvoice: ProductManufacturingInvoice;

  @ManyToOne(
    () => OrderStatus,
    (orderStatus) => orderStatus.productManufacturingOrders,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "order_status_id", referencedColumnName: "id" }])
  orderStatus: OrderStatus;

  @ManyToOne(
    () => UnitType,
    (unitType) => unitType.productManufacturingOrders,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @ManyToOne(() => Product, (product) => product.productManufacturingOrders, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;
}
