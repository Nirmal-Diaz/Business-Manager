import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
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

  @Column("varchar", { name: "employee_code", length: 10 })
  employeeCode: string;

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
