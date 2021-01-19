import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UnitType } from "./UnitType";
import { ProductStatus } from "./ProductStatus";
import { User } from "./User";
import { ProductBatch } from "./ProductBatch";
import { ProductExportRequest } from "./ProductExportRequest";
import { ProductManufacturingOrder } from "./ProductManufacturingOrder";
import { ProductMaterial } from "./ProductMaterial";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_material_quantity_type1_idx", ["unitTypeId"], {})
@Index("fk_product_product_status1_idx", ["productStatusId"], {})
@Index("fk_product_user1_idx", ["userId"], {})
@Entity("product", { schema: "business_manager" })
export class Product {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("blob", { name: "photo", nullable: true })
  photo: Buffer | null;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("decimal", { name: "reorder_amount", precision: 10, scale: 2 })
  reorderAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("decimal", { name: "unit_price", precision: 10, scale: 2 })
  unitPrice: string;

  @Column("int", { name: "product_status_id" })
  productStatusId: number;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("decimal", {
    name: "viable_amount",
    nullable: true,
    precision: 10,
    scale: 2,
  })
  viableAmount: string | null;

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

  @OneToMany(() => ProductBatch, (productBatch) => productBatch.product)
  productBatches: ProductBatch[];

  @OneToMany(
    () => ProductExportRequest,
    (productExportRequest) => productExportRequest.product
  )
  productExportRequests: ProductExportRequest[];

  @OneToMany(
    () => ProductManufacturingOrder,
    (productManufacturingOrder) => productManufacturingOrder.product
  )
  productManufacturingOrders: ProductManufacturingOrder[];

  @OneToMany(
    () => ProductMaterial,
    (productMaterial) => productMaterial.product
  )
  productMaterials: ProductMaterial[];
}
