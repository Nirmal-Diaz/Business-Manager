import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { ProductExportRequest as Entity } from "../../entities/main/ProductExportRequest";
import { ProductExportRequestRepository as EntityRepository } from "../../repositories/main/ProductExportRequestRepository";
import { UnitType } from "../../entities/main/UnitType";

export class ProductExportRequestController {
    private static entityName: string = "product export request";
    private static entityJSONName: string = "productExportRequest";

    // static async createMany(clientBindingObject, selectedProductIds) {
    //     //Validate clientBindingObject
    //     const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
    //     ValidationController.validateBindingObject(serverObject, clientBindingObject);

    //     //Clone the serverObject and change the code and productId fields for each selectedProductIds
    //     const clonedServerObjects = [];

    //     const stringifiedServerObject = JSON.stringify(serverObject);
    //     let nextCode: string = (await EntityRepository.generateNextCode()).value;
    //     for (let i = 0; i < selectedProductIds.length; i++) {
    //         clonedServerObjects[i] = JSON.parse(stringifiedServerObject);
    //         clonedServerObjects[i].productId = selectedProductIds[i];

    //         //Update the code field with next possible value
    //         clonedServerObjects[i].code = nextCode;

    //         nextCode = nextCode.slice(0, -3) + (parseInt(nextCode.slice(-3)) + 1);
    //     }

    //     return getRepository(Entity).save(clonedServerObjects as Entity[]).catch((error) => {
    //         throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
    //     });
    // }

    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //Update the code field with next possible value
        serverObject.code = (await EntityRepository.generateNextCode()).value;

        //Change the unit type to the default
        const unitType = await getRepository(UnitType).findOne(serverObject.unitTypeId);
        serverObject.requestedAmount = parseFloat(serverObject.requestedAmount) * parseFloat(unitType.convertToDefaultFactor);
        serverObject.unitTypeId = unitType.defaultUnitId;

        return getRepository(Entity).save(serverObject as Entity).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(id: number) {
        const item = await getRepository(Entity).findOne({
            where: {
                id: id
            },
            relations: ["requestStatus", "customer", "product", "unitType"]
        });

        if (item) {
            return item;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: `We couldn't find a ${this.entityName} that matches your arguments`, technicalMessage: `No ${this.entityName} for given arguments` };
        }
    }

    static async getProductAnalysis(id: number) {
        const items = await EntityRepository.getProductAnalysis(id);
        
        if (items.length > 0) {
            return items;
        } else {
            throw { title: "Oops! Couldn't analyze", titleDescription: "Contact your system administrator", message: `Looks like something's up with the database. Product analysis cannot be performed for this ${this.entityName}`, technicalMessage: `Couldn't perform product analysis for an ${this.entityName}` };
        }
    }

    static async getMany(keyword: string, offset: number) {
        const items = await EntityRepository.search(keyword, offset);

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
            relations: ["requestStatus"]
        });

        if (items.length > 0) {
            return items;
        } else {
            throw { title: `No ${this.entityName}`, titleDescription: "Try another status", message: `There are no ${this.entityName}s for the status you specified`, technicalMessage: `No ${this.entityName}s with given status` };
        }
    }

    static async getProduct(code: string) {
        const item = await getRepository(Entity).findOne({
            where: {
                code: code
            },
            relations: ["product"]
        });

        if (item) {
            return item;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: `We couldn't find a ${this.entityName} that matches your arguments`, technicalMessage: `No ${this.entityName} for given arguments` };
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
            originalObject.requestedAmount = (parseFloat(originalObject.requestedAmount) * parseFloat(unitType.convertToDefaultFactor)).toString();
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