import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Employee } from "./Employee";

@Index("name_UNIQUE", ["name"], { unique: true })
@Entity("civil_status", { schema: "business_manager" })
export class CivilStatus {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 45 })
  name: string;

  @OneToMany(() => Employee, (employee) => employee.civilStatus)
  employees: Employee[];
}
