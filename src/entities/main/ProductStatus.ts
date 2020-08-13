import { Column, Entity, OneToMany } from "typeorm";
import { Product } from "./Product";

@Entity("product_status", { schema: "business_manager" })
export class ProductStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(() => Product, (product) => product.productStatus)
  products: Product[];
}
