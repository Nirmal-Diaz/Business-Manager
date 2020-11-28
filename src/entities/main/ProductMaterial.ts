import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Material } from "./Material";
import { Product } from "./Product";

@Index("fk_material_has_product_product1_idx", ["productId"], {})
@Index("fk_material_has_product_material1_idx", ["materialId"], {})
@Entity("product_material", { schema: "business_manager" })
export class ProductMaterial {
  @Column("int", { primary: true, name: "material_id" })
  materialId: number;

  @Column("int", { primary: true, name: "product_id" })
  productId: number;

  @Column("decimal", { name: "material_amount", precision: 10, scale: 0 })
  materialAmount: string;

  @ManyToOne(() => Material, (material) => material.productMaterials, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "material_id", referencedColumnName: "id" }])
  material: Material;

  @ManyToOne(() => Product, (product) => product.productMaterials, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;
}
