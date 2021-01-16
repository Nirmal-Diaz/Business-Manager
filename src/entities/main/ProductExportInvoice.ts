import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { InboundPayment } from "./InboundPayment";
import { ProductExportOrder } from "./ProductExportOrder";
import { InvoiceStatus } from "./InvoiceStatus";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("quotation_code_UNIQUE", ["orderCode"], { unique: true })
@Index("fk_product_export_invoice_invoice_status1_idx", ["invoiceStatusId"], {})
@Entity("product_export_invoice", { schema: "business_manager" })
export class ProductExportInvoice {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "order_code", unique: true, length: 10 })
  orderCode: string;

  @Column("decimal", { name: "price", precision: 7, scale: 2 })
  price: string;

  @Column("int", { name: "dicount_percentage" })
  dicountPercentage: number;

  @Column("decimal", { name: "final_price", precision: 7, scale: 2 })
  finalPrice: string;

  @Column("int", { name: "invoice_status_id" })
  invoiceStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToMany(
    () => InboundPayment,
    (inboundPayment) => inboundPayment.invoiceCode2
  )
  inboundPayments: InboundPayment[];

  @OneToOne(
    () => ProductExportOrder,
    (productExportOrder) => productExportOrder.productExportInvoice,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "order_code", referencedColumnName: "code" }])
  orderCode2: ProductExportOrder;

  @ManyToOne(
    () => InvoiceStatus,
    (invoiceStatus) => invoiceStatus.productExportInvoices,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_status_id", referencedColumnName: "id" }])
  invoiceStatus: InvoiceStatus;
}
