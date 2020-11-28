import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { QuotationRepository } from "../../repositories/main/QuotationRepository";
import { Quotation } from "../../entities/main/Quotation";

export class QuotationController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("quotation.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //NOTE: Quotation code must be equal to the referring quotation request code except the letter code
        serverObject.code = serverObject.quotationRequestCode.replace("QRQ", "QUO");

        return getRepository(Quotation).save(serverObject as Quotation)
            .then(quotation => quotation)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(quotationId: number) {
        const quotation = await getRepository(Quotation).findOne({
            where: {
                id: quotationId
            },
            relations: ["quotationStatus"]
        });

        if (quotation) {
            return quotation;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a quotation that matches your arguments", technicalMessage: "No quotation for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const quotations = await QuotationRepository.search(keyword);

        if (quotations.length > 0) {
            return quotations;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There are no quotations matching the keyword you provided", technicalMessage: "No quotations for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Quotation).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("quotation.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(Quotation).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a quotation that matches your arguments", technicalMessage: "No quotation for given arguments" };
        }
    }

    static async deleteOne(quotationId: number) {
        return getRepository(Quotation).delete(quotationId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove any dependant records", message: "There are dependant records for this quotation. Please remove those before removing this quotation", technicalMessage: error.sqlMessage }
        });
    }
}