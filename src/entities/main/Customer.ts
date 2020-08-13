import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CustomerStatus } from "./CustomerStatus";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_customer_customer_status1_idx", ["customerStatusId"], {})
@Entity("customer", { schema: "business_manager" })
export class Customer {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "code", unique: true, length: 45 })
  code: string;

  @Column("varchar", { name: "reg_nic_number", length: 12 })
  regNicNumber: string;

  @Column("varchar", { name: "full_name", length: 150 })
  fullName: string;

  @Column("char", { name: "mobile", length: 10 })
  mobile: string;

  @Column("varchar", { name: "email", length: 45 })
  email: string;

  @Column("int", { primary: true, name: "customer_status_id" })
  customerStatusId: number;

  @ManyToOne(
    () => CustomerStatus,
    (customerStatus) => customerStatus.customers,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "customer_status_id", referencedColumnName: "id" }])
  customerStatus: CustomerStatus;
}
