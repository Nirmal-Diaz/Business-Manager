import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductExportInvoice } from "./ProductExportInvoice";

@Index("fk_inbound_payment_material_import_invoice10_idx", ["invoiceCode"], {})
@Entity("inbound_payment", { schema: "business_manager" })
export class InboundPayment {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "code", length: 45 })
  code: string;

  @Column("char", { name: "invoice_code", length: 10 })
  invoiceCode: string;

  @Column("decimal", { name: "price", precision: 10, scale: 2 })
  price: string;

  @Column("varchar", { name: "cheque_number", nullable: true, length: 45 })
  chequeNumber: string | null;

  @Column("date", { name: "cheque_date", nullable: true })
  chequeDate: string | null;

  @Column("varchar", {
    name: "bank_account_number",
    nullable: true,
    length: 45,
  })
  bankAccountNumber: string | null;

  @Column("varchar", { name: "description", nullable: true, length: 45 })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @ManyToOne(
    () => ProductExportInvoice,
    (productExportInvoice) => productExportInvoice.inboundPayments,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_code", referencedColumnName: "code" }])
  invoiceCode2: ProductExportInvoice;
}
