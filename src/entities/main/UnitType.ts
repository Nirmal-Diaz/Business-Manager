import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Material } from "./Material";
import { MaterialBatch } from "./MaterialBatch";
import { MaterialImportOrder } from "./MaterialImportOrder";
import { MaterialImportQuotation } from "./MaterialImportQuotation";
import { Product } from "./Product";
import { ProductBatch } from "./ProductBatch";
import { ProductExportRequest } from "./ProductExportRequest";
import { ProductManufacturingOrder } from "./ProductManufacturingOrder";
import { ProductMaterial } from "./ProductMaterial";
import { UnitCategory } from "./UnitCategory";

@Index("fk_unit_type_unit_category1_idx", ["unitCategoryId"], {})
@Entity("unit_type", { schema: "business_manager" })
export class UnitType {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("decimal", {
    name: "convert_to_default_factor",
    precision: 10,
    scale: 6,
  })
  convertToDefaultFactor: string;

  @Column("int", { name: "unit_category_id" })
  unitCategoryId: number;

  @Column("int", { name: "default_unit_id" })
  defaultUnitId: number;

  @OneToMany(() => Material, (material) => material.unitType)
  materials: Material[];

  @OneToMany(() => MaterialBatch, (materialBatch) => materialBatch.unitType)
  materialBatches: MaterialBatch[];

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

  @OneToMany(() => ProductBatch, (productBatch) => productBatch.unitType)
  productBatches: ProductBatch[];

  @OneToMany(
    () => ProductExportRequest,
    (productExportRequest) => productExportRequest.unitType
  )
  productExportRequests: ProductExportRequest[];

  @OneToMany(
    () => ProductManufacturingOrder,
    (productManufacturingOrder) => productManufacturingOrder.unitType
  )
  productManufacturingOrders: ProductManufacturingOrder[];

  @OneToMany(
    () => ProductMaterial,
    (productMaterial) => productMaterial.unitType
  )
  productMaterials: ProductMaterial[];

  @ManyToOne(() => UnitCategory, (unitCategory) => unitCategory.unitTypes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_category_id", referencedColumnName: "id" }])
  unitCategory: UnitCategory;
}
