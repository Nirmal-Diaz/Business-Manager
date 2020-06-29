import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { EmployeeRepository } from "../../repositories/main/EmployeeRepository";
import { RegistryController } from "./RegistryController";
import { Employee } from "../../entities/main/Employee";

export class EmployeeController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("employee.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        return getRepository(Employee).save(serverObject as Employee)
            .then(employee => employee)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(employeeId: number) {
        const employee = await getRepository(Employee).findOne({
            where: {
                id: employeeId
            },
            relations: ["gender", "employeeStatus", "civilStatus", "designation"]
        });

        if (employee) {
            return employee;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find an employee that matches your arguments", technicalMessage: "No employee for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const employees = await EmployeeRepository.search(keyword);

        if (employees.length > 0) {
            return employees;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There is no employee matching the keyword you provided", technicalMessage: "No employees for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Employee).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("employee.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(Employee).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find an employee that matches your arguments", technicalMessage: "No employee for given arguments" };
        }
    }

    static async deleteOne(employeeId: number) {
        return getRepository(Employee).delete(employeeId).catch((error) => {
            //WARNING: This error is thrown based on a possible error and not on the actual error
            throw { title: "First things first", titleDescription: "Remove dependant users first", message: "There are system users assigned to this employee. Please remove those users before removing this employee", technicalMessage: error.sqlMessage }
        });
    }
}