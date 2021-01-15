import { Column, Entity, OneToMany } from "typeorm";
import { UnitType } from "./UnitType";

@Entity("unit_category", { schema: "business_manager" })
export class UnitCategory {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(() => UnitType, (unitType) => unitType.unitCategory)
  unitTypes: UnitType[];
}
