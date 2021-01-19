import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UnitType } from "./UnitType";
import { Product } from "./Product";
import { Material } from "./Material";

@Index("fk_material_has_product_material1_idx", ["materialId"], {})
@Index("fk_material_has_product_product1_idx", ["productId"], {})
@Index("fk_product_material_unit_type1_idx", ["unitTypeId"], {})
@Entity("product_material", { schema: "business_manager" })
export class ProductMaterial {
  @Column("int", { primary: true, name: "product_id" })
  productId: number;

  @Column("int", { primary: true, name: "material_id" })
  materialId: number;

  @Column("decimal", { name: "material_amount", precision: 7, scale: 2 })
  materialAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("decimal", { name: "unit_price_factor", precision: 2, scale: 1 })
  unitPriceFactor: string;

  @ManyToOne(() => UnitType, (unitType) => unitType.productMaterials, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @ManyToOne(() => Product, (product) => product.productMaterials, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(() => Material, (material) => material.productMaterials, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "material_id", referencedColumnName: "id" }])
  material: Material;
}
