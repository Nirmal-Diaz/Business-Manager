import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Employee } from "./Employee";

@Index("name_UNIQUE", ["name"], { unique: true })
@Entity("gender", { schema: "d" })
export class Gender {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 45 })
  name: string;

  @OneToMany(() => Employee, (employee) => employee.gender)
  employees: Employee[];
}
