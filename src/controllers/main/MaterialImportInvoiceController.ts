import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { MaterialImportInvoice as Entity } from "../../entities/main/MaterialImportInvoice";
import { MaterialImportInvoiceRepository as EntityRepository } from "../../repositories/main/MaterialImportInvoiceRepository";
import { MaterialImportOrder } from "../../entities/main/MaterialImportOrder";
import { MaterialImportRequest } from "../../entities/main/MaterialImportRequest";
import { MaterialBatch } from "../../entities/main/MaterialBatch";
import { UnitType } from "../../entities/main/UnitType";

export class MaterialImportInvoiceController {
    private static entityName: string = "material import invoice";
    private static entityJSONName: string = "materialImportInvoice";

    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //NOTE: Invoice code must be equal to the referring quotation code except the letter code
        serverObject.code = serverObject.orderCode.replace("MIO", "MII");
        serverObject.materialBatch.code = serverObject.orderCode.replace("MIO", "MBT");
        serverObject.materialBatch.invoiceCode = serverObject.code;

        //Change the unit type to the default
        const unitType = await getRepository(UnitType).findOne(serverObject.materialBatch.unitTypeId);
        serverObject.materialBatch.importedAmount = parseFloat(serverObject.materialBatch.importedAmount) * parseFloat(unitType.convertToDefaultFactor);
        serverObject.materialBatch.unitTypeId = unitType.defaultUnitId;
        
        const materialImportRequest = await getRepository(MaterialImportRequest).findOne({
            where: {
                code: serverObject.orderCode.replace("MIO", "MIR")
            }
        });

        serverObject.materialBatch.materialId = materialImportRequest.materialId;

        return getRepository(Entity).save(serverObject as Entity).then(async item => {
            //Update the relevant import order to "Completed" state
            const materialImportOrder = await getRepository(MaterialImportOrder).findOne({
                where: {
                    code: item.orderCode
                }
            });

            materialImportOrder.orderStatusId = 2;

            return Promise.all([getRepository(MaterialImportOrder).save(materialImportOrder), getRepository(MaterialBatch).save(serverObject.materialBatch as MaterialBatch)]);
        }).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(id: number) {
        const item = await getRepository(Entity).findOne({
            where: {
                id: id
            },
            relations: ["invoiceStatus", "materialBatch", "materialBatch.batchStatus"]
        });

        if (item) {
            return item;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: `We couldn't find a ${this.entityName} that matches your arguments`, technicalMessage: `No ${this.entityName} for given arguments` };
        }
    }

    static async getMany(keyword: string) {
        await EntityRepository.updateTable();

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
            throw { title: `No ${this.entityName}`, titleDescription: "Try another status", message: `There are no ${this.entityName.toLowerCase()}s for the status you specified`, technicalMessage: `No ${this.entityName.toLowerCase()}s with given status` };
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