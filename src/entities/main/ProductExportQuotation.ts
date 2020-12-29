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
import { ProductExportInvoice } from "./ProductExportInvoice";
import { ProductExportRequest } from "./ProductExportRequest";
import { QuotationStatus } from "./QuotationStatus";
import { UnitType } from "./UnitType";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("quotation_request_code_UNIQUE", ["requestCode"], { unique: true })
@Index("fk_quotation_quotation_status1_idx", ["quotationStatusId"], {})
@Index("fk_quotation_unit_type1_idx", ["unitTypeId"], {})
@Entity("product_export_quotation", { schema: "business_manager" })
export class ProductExportQuotation {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "request_code", unique: true, length: 10 })
  requestCode: string;

  @Column("date", { name: "valid_from" })
  validFrom: string;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("decimal", {
    name: "available_amount",
    nullable: true,
    precision: 7,
    scale: 2,
  })
  availableAmount: string | null;

  @Column("decimal", {
    name: "unit_price",
    nullable: true,
    precision: 7,
    scale: 2,
  })
  unitPrice: string | null;

  @Column("int", { name: "quotation_status_id" })
  quotationStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToMany(
    () => ProductExportInvoice,
    (productExportInvoice) => productExportInvoice.quotation
  )
  productExportInvoices: ProductExportInvoice[];

  @OneToOne(
    () => ProductExportRequest,
    (productExportRequest) => productExportRequest.productExportQuotation,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "request_code", referencedColumnName: "code" }])
  requestCode2: ProductExportRequest;

  @ManyToOne(
    () => QuotationStatus,
    (quotationStatus) => quotationStatus.productExportQuotations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_status_id", referencedColumnName: "id" }])
  quotationStatus: QuotationStatus;

  @ManyToOne(() => UnitType, (unitType) => unitType.productExportQuotations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;
}