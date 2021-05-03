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
import { InvoiceStatus } from "./InvoiceStatus";
import { ProductExportRequest } from "./ProductExportRequest";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_product_export_invoice_invoice_status1_idx", ["invoiceStatusId"], {})
@Index("manufacturing_order_code_UNIQUE", ["requestCode"], { unique: true })
@Entity("product_export_invoice", { schema: "business_manager" })
export class ProductExportInvoice {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "request_code", unique: true, length: 10 })
  requestCode: string;

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

  @OneToMany(
    () => InboundPayment,
    (inboundPayment) => inboundPayment.invoiceCode2
  )
  inboundPayments: InboundPayment[];

  @ManyToOne(
    () => InvoiceStatus,
    (invoiceStatus) => invoiceStatus.productExportInvoices,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_status_id", referencedColumnName: "id" }])
  invoiceStatus: InvoiceStatus;

  @OneToOne(
    () => ProductExportRequest,
    (productExportRequest) => productExportRequest.productExportInvoice,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "request_code", referencedColumnName: "code" }])
  requestCode2: ProductExportRequest;
}
