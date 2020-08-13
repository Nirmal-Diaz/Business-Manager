import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material";
import { Product } from "./Product";

@Entity("quantity_type", { schema: "business_manager" })
export class QuantityType {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "industrial_unit", length: 45 })
  industrialUnit: string;

  @Column("varchar", { name: "si_unit", length: 45 })
  siUnit: string;

  @Column("decimal", { name: "conversion_factor", precision: 10, scale: 0 })
  conversionFactor: string;

  @OneToMany(() => Material, (material) => material.quantityType)
  materials: Material[];

  @OneToMany(() => Product, (product) => product.quantityType)
  products: Product[];
}
