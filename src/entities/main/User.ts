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
import { Customer } from "./Customer";
import { Supplier } from "./Supplier";
import { Material } from "./Material";
import { ProductPackage } from "./ProductPackage";
import { Product } from "./Product";
import { UserPreference } from "./UserPreference";
import { Employee } from "./Employee";
import { Role } from "./Role";

@Index("username_UNIQUE", ["username"], { unique: true })
@Index("fk_user_occupation1_idx", ["roleId"], {})
@Index("fk_user_employee1_idx", ["employeeCode"], {})
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

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @OneToMany(() => Supplier, (supplier) => supplier.user)
  suppliers: Supplier[];

  @OneToMany(() => Material, (material) => material.user)
  materials: Material[];

  @OneToMany(() => ProductPackage, (productPackage) => productPackage.user)
  productPackages: ProductPackage[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToOne(() => UserPreference, (userPreference) => userPreference.user)
  userPreference: UserPreference;

  @ManyToOne(() => Employee, (employee) => employee.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "employee_code", referencedColumnName: "code" }])
  employeeCode2: Employee;

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Role;
}
