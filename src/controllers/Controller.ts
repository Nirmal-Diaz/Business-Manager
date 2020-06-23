import * as crypto from "crypto";
import * as fs from "fs";

import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { Permission } from "../entities/Permission";
import { UserRepository, RoleRepository, EmployeeRepository } from "../repositories/Repository";
import { Role } from "../entities/Role";
import { Module } from "../entities/Module";
import { Theme } from "../entities/Theme";
import { UserPreference } from "../entities/UserPreference";
import { Employee } from "../entities/Employee";
import { Gender } from "../entities/Gender";
import { CivilStatus } from "../entities/CivilStatus";
import { EmployeeStatus } from "../entities/EmployeeStatus";
import { Designation } from "../entities/Designation";

export class TableController {
    static async getMany(tableName: string) {
        const generalEntities = {
            module: Module,
            theme: Theme,
            gender: Gender,
            civilStatus: CivilStatus,
            employeeStatus: EmployeeStatus,
            designation: Designation,
        };

        if (generalEntities.hasOwnProperty(tableName)) {
            const items = await getRepository(generalEntities[tableName]).find();
            if (items.length > 0) {
                return items;
            } else {
                throw { title: "Isn't it empty", titleDescription: "Add some items first", message: "Looks like the table you are requesting doesn't have any items in it", technicalMessage: "Requested an empty table" };
            }
        } else {
            throw { title: "Whoa! Stop right there", titleDescription: "Try logging in as a privileged role first", message: "Looks like your role don't have access to the requested data. Only general data is available for anyone that's logged in", technicalMessage: "Requested access to a non-general entity" };
        }
    }
}

export class RegistryController {
    static async getParsedFile(fileName: string) {
        if (/^[a-zA-Z]{1,}[.]{1}json$/.test(fileName)) {
            //fileName is valid and is in the format "someFile.json"
            const fullRelativeFilePath = `./src/registries/${fileName}`;
            if (fs.existsSync(fullRelativeFilePath)) {
                return JSON.parse(fs.readFileSync(fullRelativeFilePath, "utf-8"));
            } else {
                throw { title: "Oops! Couldn't find that", titleDescription: "Ensure that you are requesting the right file", message: "Our file registry doesn't have the file you are requesting. Make sure that you provided the file name along with its extension", technicalMessage: "File doesn't exist in registry" };
            }
        } else {
            throw { title: "Oops! Invalid file name", titleDescription: "Try again with a valid file name", message: "Our file registry didn't understand the file name pattern. Make sure that you provided the file name along with its extension", technicalMessage: "Invalid file name" };
        }
    }
}

export class SessionController {
    static async createOne(session, username: string, cellCombination: string) {
        const user = await UserController.getOneByUsername(username);

        const generatedHash = crypto.createHash("sha256").update(`${username} : ${cellCombination}`).digest("hex");

        if (user.userPreference.hash === generatedHash) {
            session.logged = true;
            session.userId = user.id;
            return true;
        } else {
            throw { title: "Oops! Pattern mismatch", titleDescription: "Try again with the correct pattern", message: "", technicalMessage: "Inequivalent hashes" };
        }
    }

    static async checkLogIn(session) {
        if (session.logged === true) {
            return true;
        } else {
            throw { title: "Ain't logged in", titleDescription: "Just log in", message: "You need to login to the system to perform the required action", technicalMessage: "No login records in session" };
        }
    }
}

export class PermissionController {
    //WARNING: This method has cases that fails silently
    static async cerateMany(clientBindingObject) {
        //Remove permission objects with "0000" as the value
        const tempClientBindingObject = [];
        for (let i = 0; i < clientBindingObject.length; i++) {
            if (clientBindingObject[i].value.value !== "0000") {
                tempClientBindingObject.push(clientBindingObject[i]);
            }
        }
        clientBindingObject = tempClientBindingObject;

        if (clientBindingObject.length !== 0) {
            //Validate clientBindingObject
            const serverObject = JSON.parse(fs.readFileSync("./src/registries/permissions.json", "utf-8"));
            ValidationController.validateBindingObject(serverObject, clientBindingObject);

            return getRepository(Permission).save(serverObject as Permission[])
                .catch((error) => {
                    throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql };
                });
        } else {
            return true;
        }
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
            throw { title: "You've got no permissions", titleDescription: "Contact your system administrator", message: "Looks like your role doesn't have any permissions. It may be a temporal situation or ask your system administrator for some permissions", technicalMessage: "No permissions for role" };
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
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "Looks like you don't have any modules to work with. Every user must have at least one assigned module. This could be a database error", technicalMessage: "No permitted modules for user" };
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

    //WARNING: This method deletes current permissions and recreates new ones
    static async updateMany(clientBindingObject) {
        //Remove old permission objects and create new ones
        return PermissionController.deleteMany(parseInt(clientBindingObject[0].roleId.value))
            .then(() => PermissionController.cerateMany(clientBindingObject))
            .catch((error) => {
                throw error;
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

export class UserController {
    static async createOne(clientBindingObject) {
        //Validate User
        const serverObject = JSON.parse(fs.readFileSync("./src/registries/user.json", "utf-8"));
        ValidationController.validateBindingObject(serverObject, clientBindingObject);

        return getRepository(User).save(serverObject as User)
            .then(user => UserPreferenceController.createOne(user))
            .catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
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
            relations: ["userPreference"]
        });

        if (user) {
            return user;
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
            const serverObject = JSON.parse(fs.readFileSync("./src/registries/user.json", "utf-8"));
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

export class UserPreferenceController {
    static async createOne(user: User) {
        //Create userPreference with system defaults
        const newUserPreference = new UserPreference();
        newUserPreference.userId = user.id;
        newUserPreference.hash = crypto.createHash("sha256").update(`${user.username} : A9E5I1`).digest("hex");
        newUserPreference.preferredName = user.username;
        newUserPreference.themeId = 1;
        newUserPreference.avatar = fs.readFileSync("./public/images/icon_user_default.png");

        //Create a private storage for user
        if (!fs.existsSync(`./private/${user.id}`)) {
            fs.mkdirSync(`./private/${user.id}`);
        }

        return getRepository(UserPreference).save(newUserPreference).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async deleteOne(userId: number) {
        const userPreference = await getRepository(UserPreference).findOne({
            where: {
                userId: userId
            }
        });

        if (userPreference) {
            return getRepository(UserPreference).delete(userPreference).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a user preference that matches your arguments", technicalMessage: "No user preference for given arguments" };
        }
    }
}

export class RoleController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = JSON.parse(fs.readFileSync("./src/registries/role.json", "utf-8"));
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
            const serverObject = JSON.parse(fs.readFileSync("./src/registries/role.json", "utf-8"));
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

export class EmployeeController {
    static async createOne(clientBindingObject) {
        //Validate clientBindingObject
        const serverObject = JSON.parse(fs.readFileSync("./src/registries/employee.json", "utf-8"));
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
            const serverObject = JSON.parse(fs.readFileSync("./src/registries/employee.json", "utf-8"));
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

export class ValidationController {
    //WARNING: This method directly alters the parameters provided
    static validateBindingObject(serverObject, clientBindingObject) {
        //NOTE: Validation is done considering the serverBindingObject as it always has the correct structure
        if (Array.isArray(serverObject)) {
            //Case: serverBindingObject is an array
            //NOTE: serverBindingObject only contains one reference element for all the elements inside clientBindingObject
            const stringifiedReferenceElement = JSON.stringify(serverObject[0]);
            //Validate each element inside clientBindingObject against referenceElement
            for (let i = 0; i < clientBindingObject.length; i++) {
                serverObject[i] = JSON.parse(stringifiedReferenceElement);
                this.validateBindingObject(serverObject[i], clientBindingObject[i]);
            }
        } else {
            //NOTE: serverBindingObject has the correct patterns. clientBindingObject's patterns may be altered
            //NOTE: clientBindingObject's values will be copied to serverBindingObject
            for (const key of Object.keys(serverObject)) {
                if (clientBindingObject.hasOwnProperty(key)) {
                    //Case: clientBindingObject has the same key as serverBindingObject
                    if (serverObject[key].hasOwnProperty("childFormObject") && serverObject[key].childFormObject === true) {
                        //Case: Key holds an entire new formObject
                        ValidationController.validateBindingObject(serverObject[key], clientBindingObject[key]);
                    } else {
                        //Case: Key holds a formField object
                        //Check if the clientFormField has its pattern and value properties present
                        if (clientBindingObject[key].hasOwnProperty("pattern") && clientBindingObject[key].hasOwnProperty("value")) {
                            if (serverObject[key].pattern !== null) {
                                //Case: formField object have a pattern to validate its value
                                //Validate the clientFormField.value against serverFormField.pattern
                                const regexp = new RegExp(serverObject[key].pattern);
                                if (regexp.test(clientBindingObject[key].value)) {
                                    //Case: clientFormField.value is valid
                                    //Copy that value to serverFormField.value

                                    //WARNING: serverObject's structure will be altered here
                                    //NOTE: serverObject[key] will no longer hold a formFiled object
                                    //NOTE: serverObject[key] will hold it's relevant value directly
                                    serverObject[key] = clientBindingObject[key].value;
                                } else {
                                    //Case: clientFormField.value is invalid
                                    throw { title: "Whoa! Invalid data detected", titleDescription: "Please contact your system administrator", message: "The form data you sent us contain invalid data. This is unusual and we recommend you to check your system for malware", technicalMessage: "Invalid form field data detected" };
                                }
                            }
                        } else {
                            throw { title: "Whoa! Suspicious data detected", titleDescription: "Please contact your system administrator", message: "The form data you sent us doesn't have the required fields for us to validate. This is unusual and we recommend you to check your system for malware", technicalMessage: "Altered form field objects detected" };
                        }
                    }
                } else {
                    throw { title: "Whoa! Suspicious data detected", titleDescription: "Please contact your system administrator", message: "The form data you sent us doesn't have the required fields for us to validate. This is unusual and we recommend you to check your system for malware", technicalMessage: "Altered form objects detected" };
                }
            }
        }
    }

    //WARNING: This method requires a validated serverBindingObject
    static updateOriginalObject(originalObject, serverObject) {
        for (const key of Object.keys(serverObject)) {
            if (typeof serverObject[key] === "object" && !Array.isArray(serverObject[key])) {
                //Case: Key holds an entire new formObject
                this.updateOriginalObject(originalObject[key], serverObject[key]);
            } else {
                //Case: Key holds just a value
                originalObject[key] = serverObject[key];
            }
        }
    }
}

export class FileController {
    static async readDirectory(userId: number, subDirectoryPath: string) {
        const fullRelativeDirectoryPath = `./private/${userId}/${subDirectoryPath}`;
        if (fullRelativeDirectoryPath.includes("..")) {
            throw { title: "Path isn't valid", titleDescription: "Recheck the directory path", message: "There are invalid characters in the directory path. Please remove any invalid characters and try again", technicalMessage: "Invalid characters in directory path" };
        } else if (!fs.existsSync(fullRelativeDirectoryPath)) {
            throw { title: "What directory now?", titleDescription: "Recheck the directory path", message: "We couldn't find a directory for the path you specified. Make sure that the path is correct and try again", technicalMessage: "Directory doesn't exist" };
        } else if (fs.statSync(fullRelativeDirectoryPath).isFile()) {
            throw { title: "Files aren't directories!", titleDescription: "Make sure the path leads to a directory", message: "Path you specified leads to a file. Make sure that the path is correct and try again", technicalMessage: "Found a file at directory path" };
        } else {
            const itemNames = fs.readdirSync(fullRelativeDirectoryPath);
            const directories = [];
            const files = [];
            for (const itemName of itemNames) {
                const stats = fs.statSync(`${fullRelativeDirectoryPath}/${itemName}`);
                if (stats.isDirectory()) {
                    const directory = {
                        //A "/" will be appended to every directory name as a convention
                        name: itemName + "/",
                        extension: "directory"
                    };
                    directories.push(directory);
                } else {
                    const fileExtension = itemName.slice(itemName.lastIndexOf(".")).toLowerCase();
                    const file = {
                        name: itemName,
                        size: stats.size,
                        extension: fileExtension
                    };
                    files.push(file);
                }
            }
            return {
                directories: directories,
                files: files
            };
        }
    }

    static async getFile(userId: number, filePath: string) {
        const fullRelativeFilePath = `./private/${userId}/${filePath}`;
        if (fullRelativeFilePath.includes("..")) {
            throw { title: "Path isn't valid", titleDescription: "Recheck the file path", message: "There are invalid characters in the file path. Please remove any invalid characters and try again", technicalMessage: "Invalid characters in directory path" };
        } if (!fs.existsSync(fullRelativeFilePath)) {
            throw { title: "What file now?", titleDescription: "Recheck the file path", message: "We couldn't find a file at the path you specified. Make sure that the path is correct and try again", technicalMessage: "Requested file doesn't exist" };
        } else if (fs.statSync(fullRelativeFilePath).isDirectory()) {
            throw { title: "Directories aren't files!", titleDescription: "Make sure the path leads to a file", message: "We couldn't find a file for the path you sent. It leads to a directory. Make sure that the path is correct and try again", technicalMessage: "Found a directory at file path" };
        } else {
            return fs.readFileSync(fullRelativeFilePath);
        }
    }
}

console.log("Controller status: Ready");