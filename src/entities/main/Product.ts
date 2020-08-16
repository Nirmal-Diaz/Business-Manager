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
import { QuantityType } from "./QuantityType";
import { ProductStatus } from "./ProductStatus";
import { User } from "./User";
import { ProductPackage } from "./ProductPackage";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_quantity_type1_idx", ["quantityTypeId"], {})
@Index("fk_product_product_status1_idx", ["productStatusId"], {})
@Index("fk_product_user1_idx", ["userId"], {})
@Entity("product", { schema: "business_manager" })
export class Product {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("mediumblob", { name: "photo" })
  photo: Buffer;

  @Column("decimal", { name: "available_amount", precision: 10, scale: 0 })
  availableAmount: string;

  @Column("decimal", { name: "unit_price_factor", precision: 7, scale: 2 })
  unitPriceFactor: string;

  @Column("date", { name: "viable_period" })
  viablePeriod: string;

  @Column("int", { name: "quantity_type_id" })
  quantityTypeId: number;

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

  @ManyToOne(() => QuantityType, (quantityType) => quantityType.products, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "quantity_type_id", referencedColumnName: "id" }])
  quantityType: QuantityType;

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
