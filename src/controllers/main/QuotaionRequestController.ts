import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { QuotationRequest } from "../../entities/main/QuotationRequest";
import { QuotationRequestRepository } from "../../repositories/main/QuotationRequestRepository";

export class QuotationRequestController {
    static async cerateMany(clientBindingObject, selectedSupplierIds) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("quotationRequest.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //Clone the serverObject and change the code and supplierId fields for each selectedSupplierId
        const clonedServerObjects = [];

        const stringifiedServerObject = JSON.stringify(serverObject);
        let nextCode: string = (await QuotationRequestRepository.generateNextCode()).value;
        for (let i = 0; i < selectedSupplierIds.length; i++) {
            clonedServerObjects[i] = JSON.parse(stringifiedServerObject);
            clonedServerObjects[i].supplierId = selectedSupplierIds[i];
            clonedServerObjects[i].code = nextCode;

            nextCode = nextCode.slice(0, -3) + (parseInt(nextCode.slice(-3)) + 1);
        }
        
        return getRepository(QuotationRequest).save(clonedServerObjects as QuotationRequest[])
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql };
            });
    }

    static async getOne(quotationRequestId: number) {
        const quotationRequest = await getRepository(QuotationRequest).findOne({
            where: {
                id: quotationRequestId
            },
            relations: ["quotationRequestStatus", "supplier", "material"]
        });

        if (quotationRequest) {
            return quotationRequest;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a quotation request that matches your arguments", technicalMessage: "No quotation request for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const quotationRequests = await QuotationRequestRepository.search(keyword);

        if (quotationRequests.length > 0) {
            return quotationRequests;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There are no quotation requests matching the keyword you provided", technicalMessage: "No quotation requests for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(QuotationRequest).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("quotationRequest.json");
            //NOTE: Server object is an array. But we are only updating one item
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(QuotationRequest).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a quotation request that matches your arguments", technicalMessage: "No quotation request for given arguments" };
        }
    }

    static async deleteOne(quotationRequestId: number) {
        return getRepository(QuotationRequest).delete(quotationRequestId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove any dependant records", message: "There are dependant records for this quotation request. Please remove those before removing this quotation request", technicalMessage: error.sqlMessage }
        });
    }
}