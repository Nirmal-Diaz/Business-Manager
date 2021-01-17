// import { getRepository } from "typeorm";
// import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice";
// import { ProductExportOrder } from "../../entities/main/ProductExportOrder";
// import { ProductExportQuotation } from "../../entities/main/ProductExportQuotation";
// import { ProductExportRequest } from "../../entities/main/ProductExportRequest";

// export class ProductExportController {
//     static async getSummary(numericCode) {
//         const exportRequest = await getRepository(ProductExportRequest).findOne({
//             where: {
//                 code: "PER" + numericCode
//             },
//             relations: ["requestStatus", "customer", "product"]
//         });
        
//         const exportQuotation = await getRepository(ProductExportQuotation).findOne({
//             where: {
//                 code: "PEQ" + numericCode
//             },
//             relations: ["quotationStatus", "unitType"]
//         });
//         const exportOrder = await getRepository(ProductExportOrder).findOne({
//             where: {
//                 code: "PEO" + numericCode
//             },
//             relations: ["orderStatus", "unitType"]
//         });
//         const exportInvoice = await getRepository(ProductExportInvoice).findOne({
//             where: {
//                 code: "PEI" + numericCode
//             },
//             relations: ["invoiceStatus", "productBatch", "productBatch.unitType"]
//         });

        
//         if (exportRequest) {
//             //CASE: At least the importRequest is present
//             const enhancedObjects = {
//                 enhancedRequest: null,
//                 enhancedQuotation: null,
//                 enhancedOrder: null,
//                 enhancedInvoice: null
//             }
            
//             if (exportRequest) {
//                 enhancedObjects.enhancedRequest = {
//                     customer: exportRequest.customer.businessName,
//                     product: exportRequest.product.name,
//                     wantedBy: exportRequest.wantedBy,
//                     status: exportRequest.requestStatus.name,
//                     description: exportRequest.description,
//                     addedDate: exportRequest.addedDate
//                 };
//             }
    
//             if (exportQuotation) {
//                 enhancedObjects.enhancedQuotation = {
//                     validityPeriod: `From ${exportQuotation.validFrom} to ${exportQuotation.validTill}`,
//                     weHad: `${exportQuotation.availableAmount} ${exportQuotation.unitType.name}`,
//                     unitPrice: `Rs. ${exportQuotation.unitPrice}`,
//                     status: exportQuotation.quotationStatus.name,
//                     description: exportQuotation.description,
//                     addedDate: exportQuotation.addedDate
//                 };
//             }
    
//             if (exportOrder) {
//                 enhancedObjects.enhancedOrder = {
//                     wantedBy: exportOrder.validTill,
//                     customerRequested: `${exportOrder.requestedAmount} ${exportOrder.unitType.name}`,
//                     totalPrice: `Rs. ${parseFloat(exportQuotation.unitPrice)*parseFloat(exportOrder.requestedAmount)}`,
//                     status: exportOrder.orderStatus.name,
//                     description: exportOrder.description,
//                     addedDate: exportOrder.addedDate
//                 };
//             }
    
//             if (exportInvoice) {
//                 enhancedObjects.enhancedInvoice = {
//                     supplierDelivered: `${exportInvoice.productBatch.exportedAmount} ${exportInvoice.productBatch.unitType.name}`,
//                     price: `Rs. ${parseFloat(exportQuotation.unitPrice)*parseFloat(exportInvoice.productBatch.exportedAmount)}`,
//                     ourDiscount: `${exportInvoice.discountPercentage}%`,
//                     discountedPrice: `Rs. ${parseFloat(exportQuotation.unitPrice)*parseFloat(exportInvoice.productBatch.exportedAmount)*(100-exportInvoice.discountPercentage)/100}`,
//                     status: exportInvoice.invoiceStatus.name,
//                     description: exportInvoice.description,
//                     addedDate: exportInvoice.addedDate
//                 };
//             }

//             return enhancedObjects;
//         } else {
//             throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find an import chain that matches your arguments", technicalMessage: "No import chain for given arguments" };
//         }
//     }
// }