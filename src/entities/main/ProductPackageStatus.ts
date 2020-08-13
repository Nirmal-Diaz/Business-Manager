import { Column, Entity, OneToMany } from "typeorm";
import { ProductPackage } from "./ProductPackage";

@Entity("product_package_status", { schema: "business_manager" })
export class ProductPackageStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(
    () => ProductPackage,
    (productPackage) => productPackage.productPackageStatus
  )
  productPackages: ProductPackage[];
}
