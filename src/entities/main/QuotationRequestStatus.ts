import { Column, Entity, OneToMany } from "typeorm";
import { QuotationRequest } from "./QuotationRequest";

@Entity("quotation_request_status", { schema: "business_manager" })
export class QuotationRequestStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(
    () => QuotationRequest,
    (quotationRequest) => quotationRequest.quotationRequestStatus
  )
  quotationRequests: QuotationRequest[];
}
