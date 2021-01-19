import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UnitType } from "./UnitType";
import { OrderStatus } from "./OrderStatus";
import { MaterialImportQuotation } from "./MaterialImportQuotation";
import { MaterialImportInvoice } from "./MaterialImportInvoice";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index(
  "fk_material_import_order_material_import_quotation1_idx",
  ["quotationCode"],
  {}
)
@Index("fk_material_import_order_order_status1_idx", ["orderStatusId"], {})
@Index("fk_material_import_order_unit_type1_idx", ["unitTypeId"], {})
@Index("quotation_code_UNIQUE", ["quotationCode"], { unique: true })
@Entity("material_import_order", { schema: "business_manager" })
export class MaterialImportOrder {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("char", { name: "quotation_code", unique: true, length: 10 })
  quotationCode: string;

  @Column("decimal", { name: "requested_amount", precision: 10, scale: 2 })
  requestedAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("int", { name: "order_status_id" })
  orderStatusId: number;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @ManyToOne(() => UnitType, (unitType) => unitType.materialImportOrders, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @ManyToOne(
    () => OrderStatus,
    (orderStatus) => orderStatus.materialImportOrders,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "order_status_id", referencedColumnName: "id" }])
  orderStatus: OrderStatus;

  @OneToOne(
    () => MaterialImportQuotation,
    (materialImportQuotation) => materialImportQuotation.materialImportOrder,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "quotation_code", referencedColumnName: "code" }])
  quotationCode2: MaterialImportQuotation;

  @OneToOne(
    () => MaterialImportInvoice,
    (materialImportInvoice) => materialImportInvoice.orderCode2
  )
  materialImportInvoice: MaterialImportInvoice;
}
