import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { ProductPackage } from "../../entities/main/ProductPackage";
import { ProductPackageRepository } from "../../repositories/main/ProductPackageRepository";

export class ProductPackageController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("productPackage.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        return getRepository(ProductPackage).save(serverObject as ProductPackage)
            .then(productPackage => productPackage)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(productPackageId: number) {
        const productPackage = await getRepository(ProductPackage).findOne({
            where: {
                id: productPackageId
            },
            relations: ["productPackageStatus", "product"]
        });

        if (productPackage) {
            return productPackage;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a product package that matches your arguments", technicalMessage: "No product package for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const productPackages = await ProductPackageRepository.search(keyword);

        if (productPackages.length > 0) {
            return productPackages;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There are no product packages matching the keyword you provided", technicalMessage: "No product packages for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(ProductPackage).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("productPackage.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(ProductPackage).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a product package that matches your arguments", technicalMessage: "No product package for given arguments" };
        }
    }

    static async deleteOne(productPackageId: number) {
        return getRepository(ProductPackage).delete(productPackageId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove dependant records", message: "There are dependant records for this product. Please remove those records before removing this product package", technicalMessage: error.sqlMessage }
        });
    }
}