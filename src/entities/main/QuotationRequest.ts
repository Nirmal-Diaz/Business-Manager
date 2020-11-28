import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quotation } from "./Quotation";
import { Material } from "./Material";
import { QuotationRequestStatus } from "./QuotationRequestStatus";
import { Supplier } from "./Supplier";
import { User } from "./User";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index("fk_quotation_request_supplier1_idx", ["supplierId"], {})
@Index("fk_quotation_request_material1_idx", ["materialId"], {})
@Index("fk_quotation_request_user1_idx", ["userId"], {})
@Index(
  "fk_quotation_request_quotation_request_status1_idx",
  ["quotationRequestStatusId"],
  {}
)
@Entity("quotation_request", { schema: "business_manager" })
export class QuotationRequest {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("int", { name: "quotation_request_status_id" })
  quotationRequestStatusId: number;

  @Column("int", { name: "supplier_id" })
  supplierId: number;

  @Column("int", { name: "material_id" })
  materialId: number;

  @Column("varchar", { name: "description", nullable: true, length: 45 })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @OneToMany(() => Quotation, (quotation) => quotation.quotationRequestCode2)
  quotations: Quotation[];

  @ManyToOne(() => Material, (material) => material.quotationRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "material_id", referencedColumnName: "id" }])
  material: Material;

  @ManyToOne(
    () => QuotationRequestStatus,
    (quotationRequestStatus) => quotationRequestStatus.quotationRequests,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([
    { name: "quotation_request_status_id", referencedColumnName: "id" },
  ])
  quotationRequestStatus: QuotationRequestStatus;

  @ManyToOne(() => Supplier, (supplier) => supplier.quotationRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "supplier_id", referencedColumnName: "id" }])
  supplier: Supplier;

  @ManyToOne(() => User, (user) => user.quotationRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
