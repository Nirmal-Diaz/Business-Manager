import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Employee } from "./Employee";

@Index("name_UNIQUE", ["name"], { unique: true })
@Entity("designation", { schema: "business_manager" })
export class Designation {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 45 })
  name: string;

  @OneToMany(() => Employee, (employee) => employee.designation)
  employees: Employee[];
}
