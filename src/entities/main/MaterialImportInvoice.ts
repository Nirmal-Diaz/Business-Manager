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
import { MaterialBatch } from "./MaterialBatch";
import { InvoiceStatus } from "./InvoiceStatus";
import { MaterialImportOrder } from "./MaterialImportOrder";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("order_code_UNIQUE", ["orderCode"], { unique: true })
@Index(
  "fk_material_import_invoice_invoice_status1_idx",
  ["invoiceStatusId"],
  {}
)
@Index(
  "fk_material_import_invoice_material_import_order1_idx",
  ["orderCode"],
  {}
)
@Entity("material_import_invoice", { schema: "business_manager" })
export class MaterialImportInvoice {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "order_code", unique: true, length: 10 })
  orderCode: string;

  @Column("decimal", { name: "price", precision: 7, scale: 2 })
  price: string;

  @Column("decimal", { name: "discount_ratio", precision: 10, scale: 0 })
  discountRatio: string;

  @Column("decimal", { name: "final_price", precision: 10, scale: 0 })
  finalPrice: string;

  @Column("int", { name: "invoice_status_id" })
  invoiceStatusId: number;

  @Column("varchar", { name: "description", nullable: true, length: 45 })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToMany(() => InboundPayment, (inboundPayment) => inboundPayment.invoice)
  inboundPayments: InboundPayment[];

  @OneToOne(() => MaterialBatch, (materialBatch) => materialBatch.invoiceCode2)
  materialBatch: MaterialBatch;

  @ManyToOne(
    () => InvoiceStatus,
    (invoiceStatus) => invoiceStatus.materialImportInvoices,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_status_id", referencedColumnName: "id" }])
  invoiceStatus: InvoiceStatus;

  @OneToOne(
    () => MaterialImportOrder,
    (materialImportOrder) => materialImportOrder.materialImportInvoice,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "order_code", referencedColumnName: "code" }])
  orderCode2: MaterialImportOrder;
}
