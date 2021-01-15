import { getRepository } from "typeorm";
import { MaterialImportInvoice } from "../../entities/main/MaterialImportInvoice";
import { MaterialImportOrder } from "../../entities/main/MaterialImportOrder";
import { MaterialImportQuotation } from "../../entities/main/MaterialImportQuotation";
import { MaterialImportRequest } from "../../entities/main/MaterialImportRequest";

export class MaterialImportController {
    static async getSummary(numericCode) {
        const importRequest = await getRepository(MaterialImportRequest).findOne({
            where: {
                code: "MIR" + numericCode
            },
            relations: ["requestStatus", "supplier", "material"]
        });
        
        const importQuotation = await getRepository(MaterialImportQuotation).findOne({
            where: {
                code: "MIQ" + numericCode
            },
            relations: ["quotationStatus", "unitType"]
        });
        const importOrder = await getRepository(MaterialImportOrder).findOne({
            where: {
                code: "MIO" + numericCode
            },
            relations: ["orderStatus", "unitType"]
        });
        const importInvoice = await getRepository(MaterialImportInvoice).findOne({
            where: {
                code: "MII" + numericCode
            },
            relations: ["invoiceStatus", "materialBatch", "materialBatch.unitType"]
        });

        
        if (importRequest) {
            //CASE: At least the importRequest is present
            const enhancedObjects = {
                enhancedRequest: null,
                enhancedQuotation: null,
                enhancedOrder: null,
                enhancedInvoice: null
            }
            
            if (importRequest) {
                enhancedObjects.enhancedRequest = {
                    supplier: importRequest.supplier.businessName,
                    material: importRequest.material.name,
                    wantedBy: importRequest.wantedBy,
                    status: importRequest.requestStatus.name,
                    description: importRequest.description,
                    addedDate: importRequest.addedDate
                };
            }
    
            if (importQuotation) {
                enhancedObjects.enhancedQuotation = {
                    validityPeriod: `From ${importQuotation.validFrom} to ${importQuotation.validTill}`,
                    supplierHas: `${importQuotation.availableAmount} ${importQuotation.unitType.name}`,
                    unitPrice: `Rs. ${importQuotation.unitPrice}`,
                    status: importQuotation.quotationStatus.name,
                    description: importQuotation.description,
                    addedDate: importQuotation.addedDate
                };
            }
    
            if (importOrder) {
                enhancedObjects.enhancedOrder = {
                    wantedBy: importOrder.validTill,
                    youRequested: `${importOrder.requestedAmount} ${importOrder.unitType.name}`,
                    totalPrice: `Rs. ${parseFloat(importQuotation.unitPrice)*parseFloat(importOrder.requestedAmount)}`,
                    status: importOrder.orderStatus.name,
                    description: importOrder.description,
                    addedDate: importOrder.addedDate
                };
            }
    
            if (importInvoice) {
                enhancedObjects.enhancedInvoice = {
                    supplierDelivered: `${importInvoice.materialBatch.importedAmount} ${importInvoice.materialBatch.unitType.name}`,
                    price: `Rs. ${parseFloat(importQuotation.unitPrice)*parseFloat(importInvoice.materialBatch.importedAmount)}`,
                    supplierDiscount: `${importInvoice.discountPercentage}%`,
                    discountedPrice: `Rs. ${parseFloat(importQuotation.unitPrice)*parseFloat(importInvoice.materialBatch.importedAmount)*(100-importInvoice.discountPercentage)/100}`,
                    status: importInvoice.invoiceStatus.name,
                    description: importInvoice.description,
                    addedDate: importInvoice.addedDate
                };
            }

            return enhancedObjects;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find an import chain that matches your arguments", technicalMessage: "No import chain for given arguments" };
        }
    }
}