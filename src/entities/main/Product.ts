import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PreoductMaterial } from "./PreoductMaterial";
import { UnitType } from "./UnitType";
import { ProductStatus } from "./ProductStatus";
import { User } from "./User";
import { ProductPackage } from "./ProductPackage";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_quantity_type1_idx", ["unitTypeId"], {})
@Index("fk_product_product_status1_idx", ["productStatusId"], {})
@Index("fk_product_user1_idx", ["userId"], {})
@Entity("product", { schema: "business_manager" })
export class Product {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("blob", { name: "photo" })
  photo: Buffer;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("decimal", { name: "unit_price_factor", precision: 7, scale: 2 })
  unitPriceFactor: string;

  @Column("int", { name: "viable_period" })
  viablePeriod: number;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("int", { name: "product_status_id" })
  productStatusId: number;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("int", { name: "user_id" })
  userId: number;

  @OneToMany(
    () => PreoductMaterial,
    (preoductMaterial) => preoductMaterial.product
  )
  preoductMaterials: PreoductMaterial[];

  @ManyToOne(() => UnitType, (unitType) => unitType.products, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @ManyToOne(() => ProductStatus, (productStatus) => productStatus.products, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_status_id", referencedColumnName: "id" }])
  productStatus: ProductStatus;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @OneToMany(() => ProductPackage, (productPackage) => productPackage.product)
  productPackages: ProductPackage[];
}
