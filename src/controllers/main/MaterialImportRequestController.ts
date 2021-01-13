import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { MaterialImportRequest as Entity } from "../../entities/main/MaterialImportRequest";
import { MaterialImportRequestRepository as EntityRepository } from "../../repositories/main/MaterialImportRequestRepository";

export class MaterialImportRequestController {
    private static entityName: string = "Material Import Request";
    private static entityJSONName: string = "materialImportRequest";

    static async createMany(clientBindingObject, selectedSupplierIds) {
        console.log(selectedSupplierIds);
        

        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //Clone the serverObject and change the code and supplierId fields for each selectedSupplierId
        const clonedServerObjects = [];

        const stringifiedServerObject = JSON.stringify(serverObject);
        let nextCode: string = (await EntityRepository.generateNextCode()).value;
        for (let i = 0; i < selectedSupplierIds.length; i++) {
            clonedServerObjects[i] = JSON.parse(stringifiedServerObject);
            clonedServerObjects[i].supplierId = selectedSupplierIds[i];

            //Update the code field with next possible value
            clonedServerObjects[i].code = nextCode;

            nextCode = nextCode.slice(0, -3) + (parseInt(nextCode.slice(-3)) + 1);
        }

        return getRepository(Entity).save(clonedServerObjects as Entity[]).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(id: number) {
        const item = await getRepository(Entity).findOne({
            where: {
                id: id
            },
            relations: ["requestStatus", "supplier", "material"]
        });

        if (item) {
            return item;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: `We couldn't find a ${this.entityName.toLowerCase()} that matches your arguments`, technicalMessage: `No ${this.entityName.toLowerCase()} for given arguments` };
        }
    }

    static async getMany(keyword: string) {
        const items = await EntityRepository.search(keyword);

        if (items.length > 0) {
            return items;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: `There are no ${this.entityName.toLowerCase()}s matching the keyword you provided`, technicalMessage: `No ${this.entityName.toLowerCase()}s for given keyword` };
        }
    }

    static async getManyByStatus(statusId: number) {
        const items = await getRepository(Entity).find({
            where: {
                requestStatusId: statusId
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
            throw { title: "First things first", titleDescription: "Remove any dependant records", message: `There are dependant records for this ${this.entityName.toLowerCase()}. Please remove those before removing this ${this.entityName.toLowerCase()}`, technicalMessage: error.sqlMessage }
        });
    }
}