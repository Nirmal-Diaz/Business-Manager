import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { QuotationRequest } from "./QuotationRequest";
import { QuotationStatus } from "./QuotationStatus";
import { User } from "./User";

@Index("fk_quotation_quotation_status1_idx", ["quotationStatusId"], {})
@Index("fk_quotation_quotation_request1_idx", ["quotationRequestId"], {})
@Index("fk_quotation_user1_idx", ["userId"], {})
@Entity("quotation", { schema: "business_manager" })
export class Quotation {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("char", { name: "code", length: 10 })
  code: string;

  @Column("date", { name: "valid_from" })
  validFrom: string;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("int", { name: "quotation_status_id" })
  quotationStatusId: number;

  @Column("int", { name: "quotation_request_id" })
  quotationRequestId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @ManyToOne(
    () => QuotationRequest,
    (quotationRequest) => quotationRequest.quotations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_request_id", referencedColumnName: "id" }])
  quotationRequest: QuotationRequest;

  @ManyToOne(
    () => QuotationStatus,
    (quotationStatus) => quotationStatus.quotations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_status_id", referencedColumnName: "id" }])
  quotationStatus: QuotationStatus;

  @ManyToOne(() => User, (user) => user.quotations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
