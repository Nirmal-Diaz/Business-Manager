import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MaterialImportOrder } from "./MaterialImportOrder";
import { UnitType } from "./UnitType";
import { MaterialImportRequest } from "./MaterialImportRequest";
import { QuotationStatus } from "./QuotationStatus";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("quotation_request_code_UNIQUE", ["requestCode"], { unique: true })
@Index("fk_quotation_quotation_status1_idx", ["quotationStatusId"], {})
@Index("fk_quotation_quotation_request1_idx", ["requestCode"], {})
@Index("fk_material_import_quotation_unit_type1_idx", ["unitTypeId"], {})
@Entity("material_import_quotation", { schema: "business_manager" })
export class MaterialImportQuotation {
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

  @Column("decimal", { name: "available_amount", precision: 10, scale: 2 })
  availableAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("decimal", { name: "unit_price", precision: 10, scale: 2 })
  unitPrice: string;

  @Column("int", { name: "quotation_status_id" })
  quotationStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToOne(
    () => MaterialImportOrder,
    (materialImportOrder) => materialImportOrder.quotationCode2
  )
  materialImportOrder: MaterialImportOrder;

  @ManyToOne(() => UnitType, (unitType) => unitType.materialImportQuotations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @OneToOne(
    () => MaterialImportRequest,
    (materialImportRequest) => materialImportRequest.materialImportQuotation,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "request_code", referencedColumnName: "code" }])
  requestCode2: MaterialImportRequest;

  @ManyToOne(
    () => QuotationStatus,
    (quotationStatus) => quotationStatus.materialImportQuotations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_status_id", referencedColumnName: "id" }])
  quotationStatus: QuotationStatus;
}
