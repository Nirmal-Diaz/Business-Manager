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
import { User } from "./User";
import { SupplierStatus } from "./SupplierStatus";
import { Material } from "./Material";
import { MaterialImportRequest } from "./MaterialImportRequest";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_customer_customer_status1_idx", ["supplierStatusId"], {})
@Index("fk_customer_user1_idx", ["userId"], {})
@Entity("supplier", { schema: "business_manager" })
export class Supplier {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("blob", { name: "photo" })
  photo: Buffer;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("varchar", { name: "person_name", length: 150 })
  personName: string;

  @Column("char", { name: "person_mobile", length: 10 })
  personMobile: string;

  @Column("varchar", { name: "nic_number", length: 12 })
  nicNumber: string;

  @Column("varchar", { name: "business_name", length: 150 })
  businessName: string;

  @Column("char", { name: "business_land", length: 10 })
  businessLand: string;

  @Column("varchar", { name: "reg_number", length: 12 })
  regNumber: string;

  @Column("varchar", { name: "email", length: 150 })
  email: string;

  @Column("varchar", { name: "address", length: 150 })
  address: string;

  @Column("decimal", { name: "arrears", precision: 10, scale: 2 })
  arrears: string;

  @Column("int", { name: "supplier_status_id" })
  supplierStatusId: number;

  @Column("text", { name: "description" })
  description: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @ManyToOne(() => User, (user) => user.suppliers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(
    () => SupplierStatus,
    (supplierStatus) => supplierStatus.suppliers,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "supplier_status_id", referencedColumnName: "id" }])
  supplierStatus: SupplierStatus;

  @ManyToMany(() => Material, (material) => material.suppliers)
  @JoinTable({
    name: "supplier_material",
    joinColumns: [{ name: "supplier_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "material_id", referencedColumnName: "id" }],
    schema: "business_manager",
  })
  materials: Material[];

  @OneToMany(
    () => MaterialImportRequest,
    (materialImportRequest) => materialImportRequest.supplier
  )
  materialImportRequests: MaterialImportRequest[];
}
