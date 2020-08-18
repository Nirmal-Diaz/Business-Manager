import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { Supplier } from "../../entities/main/Supplier";
import { SupplierRepository } from "../../repositories/main/SupplierRepository";

export class SupplierController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("supplier.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        return getRepository(Supplier).save(serverObject as Supplier)
            .then(supplier => supplier)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(supplierId: number) {
        const supplier = await getRepository(Supplier).findOne({
            where: {
                id: supplierId
            },
            relations: ["supplierStatus"]
        });

        if (supplier) {
            return supplier;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a supplier that matches your arguments", technicalMessage: "No supplier for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const suppliers = await SupplierRepository.search(keyword);

        if (suppliers.length > 0) {
            return suppliers;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There is no supplier matching the keyword you provided", technicalMessage: "No suppliers for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Supplier).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("supplier.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(Supplier).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a supplier that matches your arguments", technicalMessage: "No supplier for given arguments" };
        }
    }

    static async deleteOne(supplierId: number) {
        return getRepository(Supplier).delete(supplierId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove dependant materials first", message: "There are assigned material to this supplier. Please remove those materials before removing this supplier", technicalMessage: error.sqlMessage }
        });
    }
}