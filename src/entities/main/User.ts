import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "./Role";
import { Employee } from "./Employee";
import { UserPreference } from "./UserPreference";
import { Customer } from "./Customer";
import { Material } from "./Material";
import { Product } from "./Product";
import { Supplier } from "./Supplier";

@Index("fk_user_employee1_idx", ["employeeCode"], {})
@Index("fk_user_occupation1_idx", ["roleId"], {})
@Index("username_UNIQUE", ["username"], { unique: true })
@Entity("user", { schema: "business_manager" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "username", unique: true, length: 45 })
  username: string;

  @Column("tinyint", { name: "new_user", default: () => "'1'" })
  newUser: number;

  @Column("int", { name: "role_id" })
  roleId: number;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("char", { name: "employee_code", length: 10 })
  employeeCode: string;

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Role;

  @ManyToOne(() => Employee, (employee) => employee.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "employee_code", referencedColumnName: "code" }])
  employeeCode2: Employee;

  @OneToOne(() => UserPreference, (userPreference) => userPreference.user)
  userPreference: UserPreference;

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @OneToMany(() => Material, (material) => material.user)
  materials: Material[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Supplier, (supplier) => supplier.user)
  suppliers: Supplier[];
}
