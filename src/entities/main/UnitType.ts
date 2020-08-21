import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Material } from "./Material";
import { Product } from "./Product";

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

  @OneToMany(() => Product, (product) => product.unitType)
  products: Product[];
}
