import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductBatch } from "./ProductBatch";
import { InvoiceStatus } from "./InvoiceStatus";
import { ProductManufacturingOrder } from "./ProductManufacturingOrder";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_product_export_invoice_invoice_status1_idx", ["invoiceStatusId"], {})
@Index("manufacturing_order_code_UNIQUE", ["orderCode"], { unique: true })
@Entity("product_manufacturing_invoice", { schema: "business_manager" })
export class ProductManufacturingInvoice {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "order_code", unique: true, length: 10 })
  orderCode: string;

  @Column("decimal", { name: "price", precision: 10, scale: 2 })
  price: string;

  @Column("int", { name: "discount_percentage" })
  discountPercentage: number;

  @Column("decimal", { name: "final_price", precision: 10, scale: 2 })
  finalPrice: string;

  @Column("int", { name: "invoice_status_id" })
  invoiceStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToOne(() => ProductBatch, (productBatch) => productBatch.invoiceCode2)
  productBatch: ProductBatch;

  @ManyToOne(
    () => InvoiceStatus,
    (invoiceStatus) => invoiceStatus.productManufacturingInvoices,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_status_id", referencedColumnName: "id" }])
  invoiceStatus: InvoiceStatus;

  @OneToOne(
    () => ProductManufacturingOrder,
    (productManufacturingOrder) =>
      productManufacturingOrder.productManufacturingInvoice,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "order_code", referencedColumnName: "code" }])
  orderCode2: ProductManufacturingOrder;
}
