import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { ProductPackageStatus } from "./ProductPackageStatus";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_product_Package_product1_idx", ["productId"], {})
@Index(
  "fk_product_Package_product_package_status1_idx",
  ["productPackageStatusId"],
  {}
)
@Entity("product_Package", { schema: "business_manager" })
export class ProductPackage {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("varchar", { name: "available_amount", length: 45 })
  availableAmount: string;

  @Column("varchar", { name: "unit_price", length: 45 })
  unitPrice: string;

  @Column("date", { name: "introduced_date" })
  introducedDate: string;

  @Column("int", { name: "product_id" })
  productId: number;

  @Column("int", { name: "pieces" })
  pieces: number;

  @Column("int", { name: "product_package_status_id" })
  productPackageStatusId: number;

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
}
