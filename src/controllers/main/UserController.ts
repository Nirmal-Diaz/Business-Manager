import { getRepository } from "typeorm";

import { RegistryController } from "./RegistryController";
import { ValidationController } from "./ValidationController";
import { UserPreferenceController } from "./UserPreferenceController";
import { UserRepository } from "../../repositories/main/UserRepository";
import { User } from "../../entities/main/User";

export class UserController {
    static async createOne(clientBindingObject) {
        //Validate User
        const serverObject = await RegistryController.getParsedRegistry("user.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        return getRepository(User).save(serverObject as User)
            .catch(error => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            })
            .then(user => UserPreferenceController.createOne(user))
            .catch(error => {
                throw error;
            });
    }

    static async getOne(userId: number) {
        const user = await getRepository(User).findOne({
            where: {
                id: userId
            },
            relations: ["role", "userPreference", "userPreference.theme"]
        });

        if (user) {
            return user;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a user that matches your arguments", technicalMessage: "No user for given arguments" };
        }
    }

    static async getOneByUsername(username: string) {
        const user = await getRepository(User).findOne({
            where: {
                username: username
            },
            relations: ["userPreference", "employeeCode2"]
        });

        if (user) {
            if (user.employeeCode2.employeeStatusId === 1) {
                return user;
            } else {
                throw { title: "Hmm... looks like you aren't an active employee", titleDescription: "Contact your system administrator", message: "The owning employee of this account is either retired or suspended. Only operational employees can access their user account.", technicalMessage: "Owner of the user account is inactive" };
            }
        } else {
            throw { title: "Hmmm... we couldn't find you", titleDescription: "Please recheck your username", message: "There is no user matching the username you provided", technicalMessage: "No user for given username" };
        }
    }

    static async getMany(keyword: string) {
        const users = await UserRepository.search(keyword);

        if (users.length > 0) {
            return users;
        } else {
            throw { title: "Couldn't find anyone", titleDescription: "Try single words instead of phrases", message: "There is no user matching the keyword you provided", technicalMessage: "No users for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(User).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("user.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(User).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a user that matches your arguments", technicalMessage: "No user for given arguments" };
        }
    }

    static async deleteOne(userId: number) {
        //User preference must be deleted first
        await UserPreferenceController.deleteOne(userId);

        return getRepository(User).delete(userId).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }
}