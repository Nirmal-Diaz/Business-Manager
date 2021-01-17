import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { ProductExportQuotation as Entity } from "../../entities/main/ProductExportQuotation";
import { ProductExportQuotationRepository as EntityRepository } from "../../repositories/main/ProductExportQuotationRepository";
import { ProductExportRequest } from "../../entities/main/ProductExportRequest";
import { UnitType } from "../../entities/main/UnitType";

export class ProductExportQuotationController {
    private static entityName: string = "ProductExportQuotation";
    private static entityJSONName: string = "productExportQuotation";

    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //NOTE: Quotation code must be equal to the referring quotation request code except the letter code
        serverObject.code = serverObject.requestCode.replace("PER", "PEQ");

        //Change the unit type to the default
        const unitType = await getRepository(UnitType).findOne(serverObject.unitTypeId);
        serverObject.availableAmount = parseFloat(serverObject.availableAmount) * parseFloat(unitType.convertToDefaultFactor);
        serverObject.unitTypeId = unitType.defaultUnitId;

        return getRepository(Entity).save(serverObject as Entity).then(async item => {
            //Update the relevant quotation request to "Accepted" state
            const productExportRequest = await getRepository(ProductExportRequest).findOne({
                where: {
                    code: item.requestCode
                }
            });

            productExportRequest.requestStatusId = 2;

            return getRepository(ProductExportRequest).save(productExportRequest);
        }).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(id: number) {
        const item = await getRepository(Entity).findOne({
            where: {
                id: id
            },
            relations: ["quotationStatus"]
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
                quotationStatusId: statusId
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
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            //Change the unit type to the default
            const unitType = await getRepository(UnitType).findOne(originalObject.unitTypeId);
            originalObject.availableAmount = (parseFloat(originalObject.availableAmount) * parseFloat(unitType.convertToDefaultFactor)).toString();
            originalObject.unitTypeId = unitType.defaultUnitId;

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