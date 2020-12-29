import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductExportQuotation } from "./ProductExportQuotation";
import { Product } from "./Product";
import { RequestStatus } from "./RequestStatus";
import { Customer } from "./Customer";

@Index("code_UNIQUE", ["code"], { unique: true })
@Index(
  "fk_quotation_request_quotation_request_status1_idx",
  ["requestStatusId"],
  {}
)
@Index("fk_quotation_request_supplier10_idx", ["customerId"], {})
@Index("fk_quotation_request_material10_idx", ["productId"], {})
@Entity("product_export_request", { schema: "business_manager" })
export class ProductExportRequest {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "code", unique: true, length: 10 })
  code: string;

  @Column("date", { name: "valid_till" })
  validTill: string;

  @Column("int", { name: "request_status_id" })
  requestStatusId: number;

  @Column("int", { name: "customer_id" })
  customerId: number;

  @Column("int", { name: "product_id" })
  productId: number;

  @Column("varchar", { name: "description", nullable: true, length: 45 })
  description: string | null;

  @Column("date", { name: "added_date" })
  addedDate: string;

  @OneToOne(
    () => ProductExportQuotation,
    (productExportQuotation) => productExportQuotation.requestCode2
  )
  productExportQuotation: ProductExportQuotation;

  @ManyToOne(() => Product, (product) => product.productExportRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: Product;

  @ManyToOne(
    () => RequestStatus,
    (requestStatus) => requestStatus.productExportRequests,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([{ name: "request_status_id", referencedColumnName: "id" }])
  requestStatus: RequestStatus;

  @ManyToOne(() => Customer, (customer) => customer.productExportRequests, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "customer_id", referencedColumnName: "id" }])
  customer: Customer;
}
