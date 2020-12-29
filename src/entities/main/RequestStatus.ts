import { Column, Entity, OneToMany } from "typeorm";
import { MaterialImportRequest } from "./MaterialImportRequest";
import { ProductExportRequest } from "./ProductExportRequest";

@Entity("request_status", { schema: "business_manager" })
export class RequestStatus {
  @Column("int", { primary: true, name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @OneToMany(
    () => MaterialImportRequest,
    (materialImportRequest) => materialImportRequest.requestStatus
  )
  materialImportRequests: MaterialImportRequest[];

  @OneToMany(
    () => ProductExportRequest,
    (productExportRequest) => productExportRequest.requestStatus
  )
  productExportRequests: ProductExportRequest[];
}
