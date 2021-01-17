import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { Product } from "./Product";
import { UnitType } from "./UnitType";
import { RequestStatus } from "./RequestStatus";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index(
  "fk_quotation_request_quotation_request_status1_idx",
  ["requestStatusId"],
  {}
)
@Index("fk_product_export_request_product1_idx", ["productId"], {})
@Index("fk_product_export_request_unit_type1_idx", ["unitTypeId"], {})
@Index("fk_product_export_request_customer1_idx", ["customerId"], {})
@Entity("product_export_request", { schema: "business_manager" })
export class ProductExportRequest {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("int", { name: "customer_id" })
  customerId: number;

  @Column("int", { name: "product_id" })
  productId: number;

  @Column("decimal", { name: "requestedAmount", precision: 7, scale: 2 })
  requestedAmount: string;

  @Column("int", { name: "unit_type_id" })
  unitTypeId: number;

  @Column("date", { name: "wanted_by" })
  wantedBy: string;

  @Column("int", { name: "request_status_id" })
  requestStatusId: number;

  @Column("varchar", { name: "description", nullable: true, length: 45 })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @ManyToOne(() => Customer, (customer) => customer.productExportRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "customer_id", referencedColumnName: "id" }])
  customer: Customer;

  @ManyToOne(() => Product, (product) => product.productExportRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(() => UnitType, (unitType) => unitType.productExportRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "unit_type_id", referencedColumnName: "id" }])
  unitType: UnitType;

  @ManyToOne(
    () => RequestStatus,
    (requestStatus) => requestStatus.productExportRequests,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "request_status_id", referencedColumnName: "id" }])
  requestStatus: RequestStatus;
}
