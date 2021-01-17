import { Column, Entity, OneToMany } from "typeorm";
import { MaterialImportQuotation } from "./MaterialImportQuotation";

@Entity("quotation_status", { schema: "business_manager" })
export class QuotationStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(
    () => MaterialImportQuotation,
    (materialImportQuotation) => materialImportQuotation.quotationStatus
  )
  materialImportQuotations: MaterialImportQuotation[];
}
