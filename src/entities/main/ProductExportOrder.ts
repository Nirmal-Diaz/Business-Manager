import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductExportInvoice } from "./ProductExportInvoice";
import { ProductExportQuotation } from "./ProductExportQuotation";
import { OrderStatus } from "./OrderStatus";
import { UnitType } from "./UnitType";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("quotation_code_UNIQUE", ["quotationCode"], { unique: true })
@Index("fk_material_import_order_order_status1_idx", ["orderStatusId"], {})
@Index("fk_material_import_order_unit_type1_idx", ["unitTypeId"], {})
@Entity("product_export_order", { schema: "business_manager" })
export class ProductExportOrder {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "quotation_code", unique: true, length: 10 })
  quotationCode: string;

  @Column("decimal", { name: "requested_amount", precision: 7, scale: 2 })
  requestedAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("int", { name: "order_status_id" })
  orderStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToOne(
    () => ProductExportInvoice,
    (productExportInvoice) => productExportInvoice.orderCode2
  )
  productExportInvoice: ProductExportInvoice;

  @OneToOne(
    () => ProductExportQuotation,
    (productExportQuotation) => productExportQuotation.productExportOrder,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_code", referencedColumnName: "code" }])
  quotationCode2: ProductExportQuotation;

  @ManyToOne(
    () => OrderStatus,
    (orderStatus) => orderStatus.productExportOrders,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "order_status_id", referencedColumnName: "id" }])
  orderStatus: OrderStatus;

  @ManyToOne(() => UnitType, (unitType) => unitType.productExportOrders, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;
}