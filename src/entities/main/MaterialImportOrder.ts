import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MaterialImportInvoice } from "./MaterialImportInvoice";
import { MaterialImportQuotation } from "./MaterialImportQuotation";
import { OrderStatus } from "./OrderStatus";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index(
  "fk_material_import_order_material_import_quotation1_idx",
  ["quotationCode"],
  {}
)
@Index("fk_material_import_order_order_status1_idx", ["orderStatusId"], {})
@Entity("material_import_order", { schema: "business_manager" })
export class MaterialImportOrder {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "quotation_code", length: 10 })
  quotationCode: string;

  @Column("decimal", { name: "requested_amount", precision: 10, scale: 0 })
  requestedAmount: string;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @Column("int", { name: "order_status_id" })
  orderStatusId: number;

  @OneToOne(
    () => MaterialImportInvoice,
    (materialImportInvoice) => materialImportInvoice.orderCode2
  )
  materialImportInvoice: MaterialImportInvoice;

  @ManyToOne(
    () => MaterialImportQuotation,
    (materialImportQuotation) => materialImportQuotation.materialImportOrders,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_code", referencedColumnName: "code" }])
  quotationCode2: MaterialImportQuotation;

  @ManyToOne(
    () => OrderStatus,
    (orderStatus) => orderStatus.materialImportOrders,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "order_status_id", referencedColumnName: "id" }])
  orderStatus: OrderStatus;
}
