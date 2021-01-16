import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MaterialImportInvoice } from "./MaterialImportInvoice";

@Index("fk_inbound_payment_material_import_invoice1", ["invoiceCode"], {})
@Entity("outbound_payment", { schema: "business_manager" })
export class OutboundPayment {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "code", length: 45 })
  code: string;

  @Column("char", { name: "invoice_code", length: 10 })
  invoiceCode: string;

  @Column("decimal", { name: "price", precision: 7, scale: 2 })
  price: string;

  @Column("varchar", { name: "cheque_nubmer", nullable: true, length: 45 })
  chequeNubmer: string | null;

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
    () => MaterialImportInvoice,
    (materialImportInvoice) => materialImportInvoice.outboundPayments,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_code", referencedColumnName: "code" }])
  invoiceCode2: MaterialImportInvoice;
}
