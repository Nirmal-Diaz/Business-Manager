import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BatchStatus } from "./BatchStatus";
import { Product } from "./Product";
import { UnitType } from "./UnitType";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_product_batch_product1_idx", ["productId"], {})
@Index("fk_product_batch_batch_status1_idx", ["batchStatusId"], {})
@Index("fk_product_batch_unit_type1_idx", ["unitTypeId"], {})
@Entity("product_batch", { schema: "business_manager" })
export class ProductBatch {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("int", { name: "product_id" })
  productId: number;

  @Column("decimal", { name: "amount", precision: 10, scale: 0 })
  amount: string;

  @Column("int", { name: "viable_period" })
  viablePeriod: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "batch_status_id" })
  batchStatusId: number;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @ManyToOne(() => BatchStatus, (batchStatus) => batchStatus.productBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "batch_status_id", referencedColumnName: "id" }])
  batchStatus: BatchStatus;

  @ManyToOne(() => Product, (product) => product.productBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(() => UnitType, (unitType) => unitType.productBatches, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;
}
