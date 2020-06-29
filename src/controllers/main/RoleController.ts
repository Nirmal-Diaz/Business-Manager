import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { PermissionController } from "./PermissionController";
import { RoleRepository } from "../../repositories/main/RoleRepository";
import { Role } from "../../entities/main/Role";
import { User } from "../../entities/main/User";

export class RoleController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = await RegistryController.getParsedRegistry("role.json");
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        return getRepository(Role).save(serverObject as Role)
            .then(role => role)
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
    }

    static async getOne(roleId: number) {
        const role = await getRepository(Role).findOne({
            where: {
                id: roleId
            },
            relations: ["permissions", "permissions.module"]
        });

        if (role) {
            return role;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a role that matches your arguments", technicalMessage: "No user for given arguments" };
        }
    }

    static async getMany(keyword: string) {
        const roles = await RoleRepository.search(keyword);

        if (roles.length > 0) {
            return roles;
        } else {
            throw { title: "Couldn't find anything", titleDescription: "Try single words instead of phrases", message: "There is no role matching the keyword you provided", technicalMessage: "No roles for given keyword" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(Role).findOne({
            id: clientBindingObject.id.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("role.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(Role).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a role that matches your arguments", technicalMessage: "No role for given arguments" };
        }
    }

    static async deleteOne(roleId: number) {
        const users = await getRepository(User).find({
            roleId: roleId
        });

        if (users.length > 0) {
            throw { title: "First things first", titleDescription: "Remove dependant users first", message: "There are users that have this role assigned. Please remove those users before removing this role", technicalMessage: "Role to be deleted is still in use" }
        } else {
            return PermissionController.deleteMany(roleId).then(() => getRepository(Role).delete(roleId))
                .catch((error) => {
                    throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
                });
        }


    }
}