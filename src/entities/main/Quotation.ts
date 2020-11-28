import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { QuotationRequest } from "./QuotationRequest";
import { QuotationStatus } from "./QuotationStatus";
import { UnitType } from "./UnitType";
import { User } from "./User";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("quotation_request_code_UNIQUE", ["quotationRequestCode"], {
  unique: true,
})
@Index("fk_quotation_user1_idx", ["userId"], {})
@Index("fk_quotation_quotation_status1_idx", ["quotationStatusId"], {})
@Index("fk_quotation_unit_type1_idx", ["unitTypeId"], {})
@Index("fk_quotation_quotation_request1_idx", ["quotationRequestCode"], {})
@Entity("quotation", { schema: "business_manager" })
export class Quotation {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "quotation_request_code", unique: true, length: 10 })
  quotationRequestCode: string;

  @Column("date", { name: "valid_from" })
  validFrom: string;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("decimal", {
    name: "available_amount",
    nullable: true,
    precision: 7,
    scale: 2,
  })
  availableAmount: string | null;

  @Column("decimal", {
    name: "unit_price",
    nullable: true,
    precision: 7,
    scale: 2,
  })
  unitPrice: string | null;

  @Column("int", { name: "quotation_status_id" })
  quotationStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @OneToOne(
    () => QuotationRequest,
    (quotationRequest) => quotationRequest.quotation,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([
    { name: "quotation_request_code", referencedColumnName: "code" },
  ])
  quotationRequestCode2: QuotationRequest;

  @ManyToOne(
    () => QuotationStatus,
    (quotationStatus) => quotationStatus.quotations,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_status_id", referencedColumnName: "id" }])
  quotationStatus: QuotationStatus;

  @ManyToOne(() => UnitType, (unitType) => unitType.quotations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @ManyToOne(() => User, (user) => user.quotations, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
