import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PreoductMaterial } from "./PreoductMaterial";
import { MaterialStatus } from "./MaterialStatus";
import { QuantityType } from "./QuantityType";
import { User } from "./User";
import { Supplier } from "./Supplier";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_quantity_type1_idx", ["quantityTypeId"], {})
@Index("fk_material_material_status1_idx", ["materialStatusId"], {})
@Index("fk_material_user1_idx", ["userId"], {})
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

  @Column("decimal", { name: "viable_period", precision: 4, scale: 2 })
  viablePeriod: string;

  @Column("int", { name: "quantity_type_id" })
  quantityTypeId: number;

  @Column("int", { name: "material_status_id" })
  materialStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @OneToMany(
    () => PreoductMaterial,
    (preoductMaterial) => preoductMaterial.material
  )
  preoductMaterials: PreoductMaterial[];

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

  @ManyToOne(() => User, (user) => user.materials, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToMany(() => Supplier, (supplier) => supplier.materials)
  @JoinTable({
    name: "supplier_material",
    joinColumns: [{ name: "material_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "supplier_id", referencedColumnName: "id" }],
    schema: "business_manager",
  })
  suppliers: Supplier[];
}
