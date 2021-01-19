import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Supplier } from "./Supplier";
import { RequestStatus } from "./RequestStatus";
import { Material } from "./Material";
import { MaterialImportQuotation } from "./MaterialImportQuotation";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_quotation_request_material1_idx", ["materialId"], {})
@Index(
  "fk_quotation_request_quotation_request_status1_idx",
  ["requestStatusId"],
  {}
)
@Index("fk_quotation_request_supplier1_idx", ["supplierId"], {})
@Entity("material_import_request", { schema: "business_manager" })
export class MaterialImportRequest {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("date", { name: "wanted_by" })
  wantedBy: string;

  @Column("int", { name: "request_status_id" })
  requestStatusId: number;

  @Column("int", { name: "supplier_id" })
  supplierId: number;

  @Column("int", { name: "material_id" })
  materialId: number;

  @Column("varchar", { name: "description", nullable: true, length: 45 })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.materialImportRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "supplier_id", referencedColumnName: "id" }])
  supplier: Supplier;

  @ManyToOne(
    () => RequestStatus,
    (requestStatus) => requestStatus.materialImportRequests,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "request_status_id", referencedColumnName: "id" }])
  requestStatus: RequestStatus;

  @ManyToOne(() => Material, (material) => material.materialImportRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "material_id", referencedColumnName: "id" }])
  material: Material;

  @OneToOne(
    () => MaterialImportQuotation,
    (materialImportQuotation) => materialImportQuotation.requestCode2
  )
  materialImportQuotation: MaterialImportQuotation;
}
