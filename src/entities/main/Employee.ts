import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CivilStatus } from "./CivilStatus";
import { Designation } from "./Designation";
import { EmployeeStatus } from "./EmployeeStatus";
import { Gender } from "./Gender";
import { User } from "./User";

@Index("nic_no_UNIQUE", ["nicNumber"], { unique: true })
@Index("number_UNIQUE", ["code"], { unique: true })
@Index("fk_employee_gender1_idx", ["genderId"], {})
@Index("fk_employee_civil_status1_idx", ["civilStatusId"], {})
@Index("fk_employee_employee_status1_idx", ["employeeStatusId"], {})
@Index("fk_employee_designation1_idx", ["designationId"], {})
@Entity("employee", { schema: "business_manager" })
export class Employee {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("blob", { name: "photo" })
  photo: Buffer;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("varchar", { name: "full_name", length: 150 })
  fullName: string;

  @Column("varchar", { name: "preferred_name", length: 45 })
  preferredName: string;

  @Column("date", { name: "birth_date" })
  birthDate: string;

  @Column("date", { name: "employment_date" })
  employmentDate: string;

  @Column("char", { name: "nic_number", unique: true, length: 12 })
  nicNumber: string;

  @Column("text", { name: "address", nullable: true })
  address: string | null;

  @Column("char", { name: "mobile", nullable: true, length: 10 })
  mobile: string | null;

  @Column("char", { name: "land", nullable: true, length: 10 })
  land: string | null;

  @Column("int", { name: "gender_id" })
  genderId: number;

  @Column("int", { name: "civil_status_id" })
  civilStatusId: number;

  @Column("int", { name: "employee_status_id" })
  employeeStatusId: number;

  @Column("int", { name: "designation_id" })
  designationId: number;

  @ManyToOne(() => CivilStatus, (civilStatus) => civilStatus.employees, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "civil_status_id", referencedColumnName: "id" }])
  civilStatus: CivilStatus;

  @ManyToOne(() => Designation, (designation) => designation.employees, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "designation_id", referencedColumnName: "id" }])
  designation: Designation;

  @ManyToOne(
    () => EmployeeStatus,
    (employeeStatus) => employeeStatus.employees,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "employee_status_id", referencedColumnName: "id" }])
  employeeStatus: EmployeeStatus;

  @ManyToOne(() => Gender, (gender) => gender.employees, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "gender_id", referencedColumnName: "id" }])
  gender: Gender;

  @OneToMany(() => User, (user) => user.employeeCode2)
  users: User[];
}
