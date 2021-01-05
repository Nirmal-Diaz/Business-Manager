import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductExportQuotation } from "./ProductExportQuotation";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("quotation_code_UNIQUE", ["quotationCode"], { unique: true })
@Index(
  "fk_material_import_invoice_product_export_quotation1_idx",
  ["quotationCode"],
  {}
)
@Entity("product_export_invoice", { schema: "business_manager" })
export class ProductExportInvoice {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "quotation_code", unique: true, length: 10 })
  quotationCode: string;

  @Column("decimal", { name: "exported_amount", precision: 10, scale: 0 })
  exportedAmount: string;

  @Column("decimal", { name: "dicount_ratio", precision: 10, scale: 0 })
  dicountRatio: string;

  @Column("decimal", { name: "grand_total", precision: 7, scale: 2 })
  grandTotal: string;

  @Column("decimal", { name: "payed_amount", precision: 7, scale: 2 })
  payedAmount: string;

  @Column("decimal", { name: "balance", precision: 7, scale: 2 })
  balance: string;

  @OneToOne(
    () => ProductExportQuotation,
    (productExportQuotation) => productExportQuotation.productExportInvoice,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_code", referencedColumnName: "code" }])
  quotationCode2: ProductExportQuotation;
}
