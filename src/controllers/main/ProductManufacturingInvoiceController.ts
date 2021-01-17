import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { ProductManufacturingInvoice as Entity } from "../../entities/main/ProductManufacturingInvoice";
import { ProductManufacturingInvoiceRepository as EntityRepository } from "../../repositories/main/ProductManufacturingInvoiceRepository";
import { ProductBatch } from "../../entities/main/ProductBatch";
import { UnitType } from "../../entities/main/UnitType";
import { ProductManufacturingOrder } from "../../entities/main/ProductManufacturingOrder";

export class ProductManufacturingInvoiceController {
    private static entityName: string = "product manufacturing invoice";
    private static entityJSONName: string = "productManufacturingInvoice";

    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //NOTE: Invoice code must be equal to the referring order code except the letter code
        serverObject.code = serverObject.orderCode.replace("PMO", "PMI");
        serverObject.productBatch.code = serverObject.orderCode.replace("PMO", "PBT");
        serverObject.productBatch.invoiceCode = serverObject.code;

        //Change the unit type to the default
        const unitType = await getRepository(UnitType).findOne(serverObject.productBatch.unitTypeId);
        serverObject.productBatch.importedAmount = parseFloat(serverObject.productBatch.importedAmount) * parseFloat(unitType.convertToDefaultFactor);
        serverObject.productBatch.unitTypeId = unitType.defaultUnitId;
        
        const productManufacturingOrder = await getRepository(ProductManufacturingOrder).findOne({
            where: {
                code: serverObject.orderCode
            },
        });
    
        //Update relevant order status
        productManufacturingOrder.orderStatusId = 2;
        serverObject.productBatch.productId = productManufacturingOrder.productId;

        return Promise.all([getRepository(Entity).save(serverObject as Entity), getRepository(ProductManufacturingOrder).save(productManufacturingOrder)])
        .then(() => {
            return getRepository(ProductBatch).save(serverObject.productBatch as ProductBatch)
        })
        .catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(id: number) {
        const item = await getRepository(Entity).findOne({
            where: {
                id: id
            },
            relations: ["invoiceStatus", "productBatch", "productBatch.batchStatus"]
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
                invoiceStatusId: statusId
            }
        });

        if (items.length > 0) {
            return items;
        } else {
            throw { title: `No ${this.entityName}`, titleDescription: "Try another status", message: `There are no ${this.entityName}s for the status you specified`, technicalMessage: `No ${this.entityName}s with given status` };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Entity).findOne({
            where: {
                id: clientBindingObject.id.value
            },
            relations: ["productBatch"]
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);

            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return Promise.all([getRepository(Entity).save(originalObject), getRepository(ProductBatch).save(originalObject.productBatch)]).catch((error) => {
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