import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./Customer";

@Entity("customer_status", { schema: "business_manager" })
export class CustomerStatus {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(() => Customer, (customer) => customer.customerStatus)
  customers: Customer[];
}
