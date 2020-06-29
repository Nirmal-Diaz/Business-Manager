import { getRepository } from "typeorm";

import { ValidationController } from "./ValidationController";
import { RegistryController } from "./RegistryController";
import { UserController } from "./UserController";
import { Permission } from "../../entities/main/Permission";
import { Module } from "../../entities/main/Module";

export class PermissionController {
    private static async filterApplicablePermissions(clientBindingObject) {
        //Remove permission objects with "0000" as the value
        const filteredClientBindingObject = [];
        for (let i = 0; i < clientBindingObject.length; i++) {
            if (clientBindingObject[i].value.value !== "0000") {
                filteredClientBindingObject.push(clientBindingObject[i]);
            }
        }

        if (filteredClientBindingObject.length > 0) {
            return filteredClientBindingObject;
        } else {
            throw { title: "Forgot permissions?", titleDescription: "Assign some permissions for this role", message: "Every role must have a set of permissions over at least one module. You have assigned no such permissions over any module", technicalMessage: "No permissions assigned for role" };
        }
    }

    static async cerateMany(clientBindingObject) {
        return PermissionController.filterApplicablePermissions(clientBindingObject).then(async filteredClientBindingObject => {
            //Validate clientBindingObject
            const serverObject = await RegistryController.getParsedRegistry("permissions.json");
            ValidationController.validateBindingObject(serverObject, filteredClientBindingObject);

            return getRepository(Permission).save(serverObject as Permission[])
                .catch((error) => {
                    throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql };
                });
        });
    }

    static async getOne(roleId: number, moduleId: number) {
        const permission = await getRepository(Permission).findOne({
            where: {
                roleId: roleId,
                moduleId: moduleId
            },
            relations: ["role", "module"]
        });

        if (permission) {
            return permission;
        } else {
            throw { title: "Oops!", titleDescription: "Try a set of different arguments", message: "Your role doesn't have any permission records for this module", technicalMessage: "No permission for given arguments" };
        }
    }

    static async getOneByUser(userId: number, moduleId: number) {
        const user = await UserController.getOne(userId);
        return PermissionController.getOne(user.role.id, moduleId);
    }

    static async getManyByRole(roleId: number) {
        const permissions = await getRepository(Permission).find({
            where: {
                roleId: roleId
            },
            relations: ["module"]
        });

        if (permissions.length > 0) {
            return permissions;
        } else {
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "Looks like your role doesn't have any permissions assigned. Every user must have at least one permission over at least one module. This could is definitely a problem on our side. Please contact your system administrator", technicalMessage: "No permissions for role" };
        }
    }

    static async getPermittedModules(userId: number) {
        const user = await UserController.getOne(userId);
        const permissions = await PermissionController.getManyByRole(user.role.id);

        //NOTE: Permitted modules are the ones that have explicit "retrieve" permissions
        //NOTE: Although every user have "retrieve" permissions for general modules, They aren't considered permittedModules unless that user have a permissions record with retrieve access for that module
        const permittedModules = [];
        for (let i = 0; i < permissions.length; i++) {
            if (permissions[i].value[1] === "1") {
                permittedModules.push(permissions[i].module);
            }
        }

        if (permittedModules.length > 0) {
            return permittedModules;
        } else {
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "Looks like you don't have any modules to work with. Every user must have at least one assigned module. This could is definitely a problem on our side. Please contact your system administrator", technicalMessage: "No permitted modules for user" };
        }
    }

    static async checkPermission(userId: number, moduleSelector: number | string, operationName: string) {
        if (typeof moduleSelector === "string") {
            const module = await getRepository(Module).findOne({
                where: {
                    name: moduleSelector
                }
            });
            moduleSelector = module.id;
        }

        const user = await UserController.getOne(userId);
        const permission = await PermissionController.getOne(user.role.id, moduleSelector);

        const operationIndexMap = {
            PUT: 0,
            GET: 1,
            PATCH: 2,
            POST: 2,
            DELETE: 3
        }

        if (permission.value[operationIndexMap[operationName]] === "1") {
            return true;
        } else {
            throw { title: "Whoa! Stop right there", titleDescription: "Contact your system administrator", message: `Looks like you don't have permissions to ${operationName.toLowerCase()} items in the current module`, technicalMessage: "Operation permissions denied" };
        }
    }

    static async updateMany(clientBindingObject) {
        return PermissionController.filterApplicablePermissions(clientBindingObject).then(async filteredClientBindingObject => {
            //Delete existing permissions
            await PermissionController.deleteMany(parseInt(filteredClientBindingObject[0].roleId.value));

            //Validate clientBindingObject
            const serverObject = await RegistryController.getParsedRegistry("permissions.json");
            ValidationController.validateBindingObject(serverObject, filteredClientBindingObject);

            return getRepository(Permission).save(serverObject as Permission[])
                .catch((error) => {
                    throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql };
                });
        });
    }

    //WARNING: This method has cases that fails silently
    static async deleteMany(roleId: number) {
        const permissions = await getRepository(Permission).find({
            where: {
                roleId: roleId
            }
        });

        if (permissions.length > 0) {
            return getRepository(Permission).remove(permissions).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            return true;
        }
    }
}