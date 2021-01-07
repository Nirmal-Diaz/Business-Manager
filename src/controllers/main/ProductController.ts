import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { Product as Entity } from "../../entities/main/Product";
import { ProductRepository as EntityRepository } from "../../repositories/main/ProductRepository";
import { ProductMaterial } from "../../entities/main/ProductMaterial";

export class ProductController {
    private static entityName: string = "product";
    private static entityJSONName: string = "product";

    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry(`${this.entityJSONName}.json`);
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //Update the code field with next possible value
        serverObject.code = (await EntityRepository.generateNextCode()).value;

        return getRepository(Entity).save(serverObject as Entity).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(id: number) {
        const item = await getRepository(Entity).findOne({
            where: {
                id: id
            },
            relations: ["productStatus", "unitType"]
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

    static async getProductMaterialRelations() {
        const items = await getRepository(ProductMaterial).find();

        if (items.length > 0) {
            const productId2MaterialData = {};

            for (const productMaterial of items) {
                if (!productId2MaterialData.hasOwnProperty(productMaterial.productId)) {
                    productId2MaterialData[productMaterial.productId] = [];
                }

                productId2MaterialData[productMaterial.productId].push({
                    productId: productMaterial.productId,
                    materialId: productMaterial.materialId,
                    materialAmount: productMaterial.materialAmount
                });
            }

            return productId2MaterialData;
        } else {
            throw { title: "Oops!", titleDescription: "Add some items first", message: `We found no associations in the ${this.entityName}-material database`, technicalMessage: `No associations in the product-material database` };
        }
    }

    static async getMaterialsByProduct(productId: number) {
        const productMaterials = await getRepository(ProductMaterial).find({
            where: {
                productId: productId
            },
            relations: ["material"]
        });

        const materials = productMaterials.map((productMaterial) => {
            return productMaterial.material;
        })

        if (materials.length > 0) {
            return materials;
        } else {
            throw { title: "Oops!", titleDescription: "Add some items first", message: "We found no suppliers for this material", technicalMessage: "No suppliers for the material" };
        }
    }

    static async setProductMaterialRelations(clientBindingObject) {
        //Clear the whole table product_material
        await getRepository(ProductMaterial).clear();

        const productMaterials = [];

        for (const id of Object.keys(clientBindingObject)) {
            productMaterials.push(...clientBindingObject[id]);
        }
        
        return getRepository(ProductMaterial).save(productMaterials as ProductMaterial[]);
    }
}