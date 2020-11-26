import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { Product } from "../../entities/main/Product";
import { ProductRepository } from "../../repositories/main/ProductRepository";

export class ProductController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("product.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //Update the code field with next possible value
        serverObject.code = (await ProductRepository.generateNextCode()).value;

        return getRepository(Product).save(serverObject as Product)
            .then(product => product)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(productId: number) {
        const product = await getRepository(Product).findOne({
            where: {
                id: productId
            },
            relations: ["productStatus", "unitType"]
        });

        if (product) {
            return product;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a product that matches your arguments", technicalMessage: "No product for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const products = await ProductRepository.search(keyword);

        if (products.length > 0) {
            return products;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There are no products matching the keyword you provided", technicalMessage: "No products for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Product).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("product.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(Product).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a product that matches your arguments", technicalMessage: "No product for given arguments" };
        }
    }

    static async deleteOne(productId: number) {
        return getRepository(Product).delete(productId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove dependant product package records", message: "There are dependant product packages for this product. Please remove those records before removing this product", technicalMessage: error.sqlMessage }
        });
    }
}