import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { Customer } from "../../entities/main/Customer";
import { CustomerRepository } from "../../repositories/main/CustomerRepository";

export class CustomerController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("customer.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        //Update the code field with next possible value
        serverObject.code = (await CustomerRepository.generateNextCode()).value;

        return getRepository(Customer).save(serverObject as Customer)
            .then(customer => customer)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(customerId: number) {
        const customer = await getRepository(Customer).findOne({
            where: {
                id: customerId
            },
            relations: ["customerStatus"]
        });

        if (customer) {
            return customer;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a customer that matches your arguments", technicalMessage: "No customer for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const customers = await CustomerRepository.search(keyword);

        if (customers.length > 0) {
            return customers;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There are no customers matching the keyword you provided", technicalMessage: "No customers for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Customer).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("customer.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(Customer).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a customer that matches your arguments", technicalMessage: "No customer for given arguments" };
        }
    }

    static async deleteOne(customerId: number) {
        return getRepository(Customer).delete(customerId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove any dependant records", message: "There are dependant records for this customer. Please remove those before removing this supplier", technicalMessage: error.sqlMessage }
        });
    }
}