import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BatchStatus } from "./BatchStatus";
import { Material } from "./Material";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_batch_material1_idx", ["materialId"], {})
@Index("fk_material_batch_batch_status1_idx", ["batchStatusId"], {})
@Entity("material_batch", { schema: "business_manager" })
export class MaterialBatch {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("int", { name: "material_id" })
  materialId: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("decimal", { name: "amount", precision: 10, scale: 0 })
  amount: string;

  @Column("int", { name: "viable_period" })
  viablePeriod: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { primary: true, name: "batch_status_id" })
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
}
