import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { ProductPackageStatus } from "./ProductPackageStatus";
import { User } from "./User";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_product_Package_product1_idx", ["productId"], {})
@Index(
  "fk_product_Package_product_package_status1_idx",
  ["productPackageStatusId"],
  {}
)
@Index("fk_product_package_user1_idx", ["userId"], {})
@Entity("product_package", { schema: "business_manager" })
export class ProductPackage {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("blob", { name: "photo" })
  photo: Buffer;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("decimal", { name: "unit_price_factor", precision: 10, scale: 0 })
  unitPriceFactor: string;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "product_id" })
  productId: number;

  @Column("decimal", { name: "product_amount", precision: 10, scale: 0 })
  productAmount: string;

  @Column("int", { name: "product_package_status_id" })
  productPackageStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("int", { name: "user_id" })
  userId: number;

  @ManyToOne(() => Product, (product) => product.productPackages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(
    () => ProductPackageStatus,
    (productPackageStatus) => productPackageStatus.productPackages,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([
    { name: "product_package_status_id", referencedColumnName: "id" },
  ])
  productPackageStatus: ProductPackageStatus;

  @ManyToOne(() => User, (user) => user.productPackages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
