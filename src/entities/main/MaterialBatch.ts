import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BatchStatus } from "./BatchStatus";
import { Material } from "./Material";
import { MaterialImportInvoice } from "./MaterialImportInvoice";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_batch_batch_status1_idx", ["batchStatusId"], {})
@Index("fk_material_batch_material1_idx", ["materialId"], {})
@Index("fk_material_batch_material_import_invoice1_idx", ["invoiceCode"], {})
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

  @Column("decimal", { name: "imported_amount", precision: 10, scale: 0 })
  importedAmount: string;

  @Column("int", { name: "viable_period" })
  viablePeriod: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "batch_status_id" })
  batchStatusId: number;

  @ManyToOne(() => BatchStatus, (batchStatus) => batchStatus.materialBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "batch_status_id", referencedColumnName: "id" }])
  batchStatus: BatchStatus;

  @ManyToOne(() => Material, (material) => material.materialBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "material_id", referencedColumnName: "id" }])
  material: Material;

  @OneToOne(
    () => MaterialImportInvoice,
    (materialImportInvoice) => materialImportInvoice.materialBatch,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "invoice_code", referencedColumnName: "code" }])
  invoiceCode2: MaterialImportInvoice;
}
