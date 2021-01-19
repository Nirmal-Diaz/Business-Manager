import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UnitType } from "./UnitType";
import { MaterialImportInvoice } from "./MaterialImportInvoice";
import { Material } from "./Material";
import { BatchStatus } from "./BatchStatus";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_batch_batch_status1_idx", ["batchStatusId"], {})
@Index("fk_material_batch_material1_idx", ["materialId"], {})
@Index("fk_material_batch_unit_type1_idx", ["unitTypeId"], {})
@Index("invoice_code_UNIQUE", ["invoiceCode"], { unique: true })
@Entity("material_batch", { schema: "business_manager" })
export class MaterialBatch {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "invoice_code", unique: true, length: 10 })
  invoiceCode: string;

  @Column("int", { name: "material_id" })
  materialId: number;

  @Column("decimal", { name: "imported_amount", precision: 10, scale: 2 })
  importedAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("int", { name: "viable_period" })
  viablePeriod: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "batch_status_id" })
  batchStatusId: number;

  @ManyToOne(() => UnitType, (unitType) => unitType.materialBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @OneToOne(
    () => MaterialImportInvoice,
    (materialImportInvoice) => materialImportInvoice.materialBatch,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_code", referencedColumnName: "code" }])
  invoiceCode2: MaterialImportInvoice;

  @ManyToOne(() => Material, (material) => material.materialBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "material_id", referencedColumnName: "id" }])
  material: Material;

  @ManyToOne(() => BatchStatus, (batchStatus) => batchStatus.materialBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "batch_status_id", referencedColumnName: "id" }])
  batchStatus: BatchStatus;
}
