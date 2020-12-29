import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ProductExportQuotation } from "./ProductExportQuotation";

@Index(
  "fk_material_import_invoice_product_export_quotation1_idx",
  ["quotationId"],
  {}
)
@Entity("product_export_invoice", { schema: "business_manager" })
export class ProductExportInvoice {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("char", { name: "code", length: 10 })
  code: string;

  @Column("int", { name: "quotation_id" })
  quotationId: number;

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

  @ManyToOne(
    () => ProductExportQuotation,
    (productExportQuotation) => productExportQuotation.productExportInvoices,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_id", referencedColumnName: "id" }])
  quotation: ProductExportQuotation;
}
