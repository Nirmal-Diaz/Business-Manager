import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { ProductExportInvoice as Entity } from "../../entities/main/ProductExportInvoice";
import { ProductExportInvoiceRepository as EntityRepository } from "../../repositories/main/ProductExportInvoiceRepository";
import { UnitType } from "../../entities/main/UnitType";
import { ProductExportRequest } from "../../entities/main/ProductExportRequest";
import { Product } from "../../entities/main/Product";
import { Customer } from "../../entities/main/Customer";

export class ProductExportInvoiceController {
    private static entityName: string = "product export invoice";
    private static entityJSONName: string = "productExportInvoice";

    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //NOTE: Invoice code must be equal to the referring quotation code except the letter code
        serverObject.code = serverObject.requestCode.replace("PER", "PEI");
        
        const productExportRequest = await getRepository(ProductExportRequest).findOne({
            where: {
                code: serverObject.requestCode.replace("PER", "PEI")
            },
            relations: ["product", "customer"]
        });

        //Decrease product inventory
        productExportRequest.product.viableAmount = (parseFloat(productExportRequest.product.viableAmount) - parseFloat(productExportRequest.requestedAmount)).toString();

        //Change product status
        if (productExportRequest.product.viableAmount <= productExportRequest.product.reorderAmount) {
            productExportRequest.product.productStatusId = 2;
        }

        //Increase customer's arrears
        productExportRequest.customer.arrears = (parseFloat(productExportRequest.customer.arrears ) + parseFloat(serverObject.finalPrice)).toString();
    
        //Update request status
        productExportRequest.requestStatusId = 2;

        return Promise.all([getRepository(Entity).save(serverObject as Entity), getRepository(Product).save(productExportRequest.product), getRepository(Customer).save(productExportRequest.customer), getRepository(ProductExportRequest).save(productExportRequest)])
        .catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(id: number) {
        const item = await getRepository(Entity).findOne({
            where: {
                id: id
            },
            relations: ["invoiceStatus"]
        });

        if (item) {
            return item;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: `We couldn't find a ${this.entityName} that matches your arguments`, technicalMessage: `No ${this.entityName} for given arguments` };
        }
    }

    static async getMany(keyword: string) {
        const items = await EntityRepository.search(keyword);

        if (items.length > 0) {
            return items;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: `There are no ${this.entityName}s matching the keyword you provided`, technicalMessage: `No ${this.entityName}s for given keyword` };
        }
    }

    static async getManyByStatus(statusId: number) {
        const items = await getRepository(Entity).find({
            where: {
                requestStatusId: statusId
            },
            relations: ["invoiceStatus"]
        });

        if (items.length > 0) {
            return items;
        } else {
            throw { title: `No ${this.entityName}`, titleDescription: "Try another status", message: `There are no ${this.entityName}s for the status you specified`, technicalMessage: `No ${this.entityName}s with given status` };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Entity).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);
            
            return getRepository(Entity).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: `We couldn't find a ${this.entityName} that matches your arguments`, technicalMessage: `No ${this.entityName} for given arguments` };
        }
    }

    static async deleteOne(id: number) {
        return getRepository(Entity).delete(id).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove any dependant records", message: `There are dependant records for this ${this.entityName}. Please remove those before removing this ${this.entityName}`, technicalMessage: error.sqlMessage }
        });
    }
}