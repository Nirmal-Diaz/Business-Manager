import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MaterialImportInvoice } from "./MaterialImportInvoice";

@Index("fk_inbound_payment_material_import_invoice1_idx", ["invoiceId"], {})
@Entity("inbound_payment", { schema: "business_manager" })
export class InboundPayment {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "code", length: 45 })
  code: string;

  @Column("int", { name: "invoice_id" })
  invoiceId: number;

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
    (materialImportInvoice) => materialImportInvoice.inboundPayments,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_id", referencedColumnName: "id" }])
  invoice: MaterialImportInvoice;
}
