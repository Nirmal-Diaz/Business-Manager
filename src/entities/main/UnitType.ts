import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material";
import { MaterialImportOrder } from "./MaterialImportOrder";
import { MaterialImportQuotation } from "./MaterialImportQuotation";
import { Product } from "./Product";
import { ProductExportQuotation } from "./ProductExportQuotation";

@Entity("unit_type", { schema: "business_manager" })
export class UnitType {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("varchar", { name: "symbol", length: 20 })
  symbol: string;

  @OneToMany(() => Material, (material) => material.unitType)
  materials: Material[];

  @OneToMany(
    () => MaterialImportOrder,
    (materialImportOrder) => materialImportOrder.unitType
  )
  materialImportOrders: MaterialImportOrder[];

  @OneToMany(
    () => MaterialImportQuotation,
    (materialImportQuotation) => materialImportQuotation.unitType
  )
  materialImportQuotations: MaterialImportQuotation[];

  @OneToMany(() => Product, (product) => product.unitType)
  products: Product[];

  @OneToMany(
    () => ProductExportQuotation,
    (productExportQuotation) => productExportQuotation.unitType
  )
  productExportQuotations: ProductExportQuotation[];
}
