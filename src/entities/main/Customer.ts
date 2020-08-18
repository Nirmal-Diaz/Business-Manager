import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CustomerStatus } from "./CustomerStatus";
import { User } from "./User";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_customer_customer_status1_idx", ["customerStatusId"], {})
@Index("fk_customer_user1_idx", ["userId"], {})
@Entity("customer", { schema: "business_manager" })
export class Customer {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "code", unique: true, length: 45 })
  code: string;

  @Column("blob", { name: "photo" })
  photo: Buffer;

  @Column("varchar", { name: "person_name", length: 150 })
  personName: string;

  @Column("char", { name: "person_mobile", length: 10 })
  personMobile: string;

  @Column("varchar", { name: "nic_number", length: 12 })
  nicNumber: string;

  @Column("varchar", { name: "business_name", length: 150 })
  businessName: string;

  @Column("char", { name: "business_land", length: 10 })
  businessLand: string;

  @Column("varchar", { name: "reg_number", length: 12 })
  regNumber: string;

  @Column("varchar", { name: "email", length: 150 })
  email: string;

  @Column("text", { name: "address" })
  address: string;

  @Column("decimal", { name: "discount_factor", precision: 10, scale: 0 })
  discountFactor: string;

  @Column("decimal", { name: "arrears", precision: 8, scale: 2 })
  arrears: string;

  @Column("int", { name: "customer_status_id" })
  customerStatusId: number;

  @Column("text", { name: "description" })
  description: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @ManyToOne(
    () => CustomerStatus,
    (customerStatus) => customerStatus.customers,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "customer_status_id", referencedColumnName: "id" }])
  customerStatus: CustomerStatus;

  @ManyToOne(() => User, (user) => user.customers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
