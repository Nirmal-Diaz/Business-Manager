import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MaterialImportInvoice } from "./MaterialImportInvoice";
import { ProductManufacturingInvoice } from "./ProductManufacturingInvoice";
import { ProductExportInvoice } from "./ProductExportInvoice";

@Entity("invoice_status", { schema: "business_manager" })
export class InvoiceStatus {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(
    () => MaterialImportInvoice,
    (materialImportInvoice) => materialImportInvoice.invoiceStatus
  )
  materialImportInvoices: MaterialImportInvoice[];

  @OneToMany(
    () => ProductManufacturingInvoice,
    (productManufacturingInvoice) => productManufacturingInvoice.invoiceStatus
  )
  productManufacturingInvoices: ProductManufacturingInvoice[];

  @OneToMany(
    () => ProductExportInvoice,
    (productExportInvoice) => productExportInvoice.invoiceStatus
  )
  productExportInvoices: ProductExportInvoice[];
}
