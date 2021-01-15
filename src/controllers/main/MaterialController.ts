import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { Material as Entity } from "../../entities/main/Material";
import { MaterialRepository as EntityRepository } from "../../repositories/main/MaterialRepository";
import { Supplier } from "../../entities/main/Supplier";
import { UnitType } from "../../entities/main/UnitType";

export class MaterialController {
    private static entityName: string = "material";
    private static entityJSONName: string = "material";

    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //Update the code field with next possible value
        serverObject.code = (await EntityRepository.generateNextCode()).value;

        //Change the unit type to the default
        const unitType = await getRepository(UnitType).findOne(serverObject.unitTypeId);
        serverObject.reorderAmount = parseFloat(serverObject.reorderAmount) * parseFloat(unitType.convertToDefaultFactor);
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
            relations: ["materialStatus", "unitType"]
        });

        if (item) {
            return item;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: `We couldn't find a ${this.entityName} that matches your arguments`, technicalMessage: `No ${this.entityName} for given arguments` };
        }
    }

    static async getDerivedOne(id: number) {
        return (await EntityRepository.getDerivedOne(id))[0];
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
            originalObject.reorderAmount = (parseFloat(originalObject.reorderAmount) * parseFloat(unitType.convertToDefaultFactor)).toString();
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

    static async getMaterialSupplierRelations() {
        const items = await getRepository(Entity).find({
            relations: ["suppliers"]
        });

        if (items.length > 0) {
            const materialId2SupplierIds = {};

            for (const material of items) {
                materialId2SupplierIds[material.id] = [];
                for (const supplier of material.suppliers) {
                    materialId2SupplierIds[material.id].push(supplier.id);
                }
            }

            return materialId2SupplierIds;
        } else {
            throw { title: "Oops!", titleDescription: "Add some items first", message: `We found no ${this.entityName}s in the ${this.entityName} database`, technicalMessage: `No ${this.entityName}s in the database` };
        }
    }

    static async getSuppliersByMaterial(materialId: number) {
        const material = await getRepository(Entity).findOne({
            where: {
                id: materialId
            },
            relations: ["suppliers"]
        });

        if (material.suppliers.length > 0) {
            return material.suppliers;
        } else {
            throw { title: "Oops!", titleDescription: "Add some items first", message: "We found no suppliers for this material", technicalMessage: "No suppliers for the material" };
        }
    }

    static async setMaterialSupplierRelations(clientBindingObject) {
        for (const id of Object.keys(clientBindingObject)) {
            const item = await getRepository(Entity).findOne(id);
            if (clientBindingObject[id].length === 0) {
                item.suppliers = [];
            } else {
                item.suppliers = await getRepository(Supplier).findByIds(clientBindingObject[id]);
            }
            await getRepository(Entity).save(item);
        }

        return true;
    }
}