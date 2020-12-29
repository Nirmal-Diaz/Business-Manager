import { Column, Entity, OneToMany } from "typeorm";
import { MaterialBatch } from "./MaterialBatch";
import { ProductBatch } from "./ProductBatch";

@Entity("batch_status", { schema: "business_manager" })
export class BatchStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(() => MaterialBatch, (materialBatch) => materialBatch.batchStatus)
  materialBatches: MaterialBatch[];

  @OneToMany(() => ProductBatch, (productBatch) => productBatch.batchStatus)
  productBatches: ProductBatch[];
}
