import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { Material } from "../../entities/main/Material";
import { MaterialRepository } from "../../repositories/main/MaterialRepository";

export class MaterialController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("material.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        return getRepository(Material).save(serverObject as Material)
            .then(material => material)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(materialId: number) {
        const material = await getRepository(Material).findOne({
            where: {
                id: materialId
            },
            relations: ["materialStatus", "unitType"]
        });

        if (material) {
            return material;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a material that matches your arguments", technicalMessage: "No material for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const materials = await MaterialRepository.search(keyword);

        if (materials.length > 0) {
            return materials;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There are no materials matching the keyword you provided", technicalMessage: "No materials for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Material).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("material.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(Material).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a material that matches your arguments", technicalMessage: "No material for given arguments" };
        }
    }

    static async deleteOne(materialId: number) {
        return getRepository(Material).delete(materialId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove dependant supplier records", message: "There are dependant supplier records for this material. Please remove those before removing this material", technicalMessage: error.sqlMessage }
        });
    }
}