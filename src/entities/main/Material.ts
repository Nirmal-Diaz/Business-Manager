import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MaterialStatus } from "./MaterialStatus";
import { QuantityType } from "./QuantityType";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_quantity_type1_idx", ["quantityTypeId"], {})
@Index("fk_material_material_status1_idx", ["materialStatusId"], {})
@Entity("material", { schema: "business_manager" })
export class Material {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("decimal", { name: "available_amount", precision: 10, scale: 0 })
  availableAmount: string;

  @Column("decimal", { name: "reorder_amount", precision: 10, scale: 0 })
  reorderAmount: string;

  @Column("decimal", { name: "unit_price", precision: 7, scale: 2 })
  unitPrice: string;

  @Column("date", { name: "manufactured_date" })
  manufacturedDate: string;

  @Column("date", { name: "viable_period" })
  viablePeriod: string;

  @Column("int", { name: "quantity_type_id" })
  quantityTypeId: number;

  @Column("int", { name: "material_status_id" })
  materialStatusId: number;

  @ManyToOne(
    () => MaterialStatus,
    (materialStatus) => materialStatus.materials,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "material_status_id", referencedColumnName: "id" }])
  materialStatus: MaterialStatus;

  @ManyToOne(() => QuantityType, (quantityType) => quantityType.materials, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "quantity_type_id", referencedColumnName: "id" }])
  quantityType: QuantityType;
}
