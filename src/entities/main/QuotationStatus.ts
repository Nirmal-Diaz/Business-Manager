import { Column, Entity, OneToMany } from "typeorm";
import { Quotation } from "./Quotation";

@Entity("quotation_status", { schema: "business_manager" })
export class QuotationStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(() => Quotation, (quotation) => quotation.quotationStatus)
  quotations: Quotation[];
}
