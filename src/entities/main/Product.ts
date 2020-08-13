import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { QuantityType } from "./QuantityType";
import { ProductStatus } from "./ProductStatus";
import { ProductPackage } from "./ProductPackage";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_quantity_type1_idx", ["quantityTypeId"], {})
@Index("fk_product_product_status1_idx", ["productStatusId"], {})
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

  @Column("decimal", { name: "unit_price", precision: 7, scale: 2 })
  unitPrice: string;

  @Column("date", { name: "manufactured_date" })
  manufacturedDate: string;

  @Column("date", { name: "viable_period" })
  viablePeriod: string;

  @Column("int", { name: "quantity_type_id" })
  quantityTypeId: number;

  @Column("int", { name: "product_status_id" })
  productStatusId: number;

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

  @OneToMany(() => ProductPackage, (productPackage) => productPackage.product)
  productPackages: ProductPackage[];
}
