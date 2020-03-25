import * as crypto from "crypto";
import * as fs from "fs";

import { getRepository} from "typeorm";
import { User } from "../entity/User";
import { Permission } from "../entity/Permission";
import { UserRepository } from "../repository/Repository";
import { Role } from "../entity/Role";
import { Module } from "../entity/Module";
import { Theme } from "../entity/Theme";

export class GeneralController {
    static async getItems(tableName: string, restrictNonGeneralData: boolean) {
        const generalEntities = {
            role: Role,
            module: Module,
            theme: Theme
        };
        if (restrictNonGeneralData && generalEntities.hasOwnProperty(tableName)) {
            const items = await getRepository(generalEntities[tableName]).find();
            if (items.length > 0) {
                return items;
            } else {
                throw { title: "Isn't it empty", titleDescription: "Add some items first", message: "Looks like the table you are requesting doesn't have any items in it", technicalMessage: "Requested an empty table" };
            }
        } else if (restrictNonGeneralData) {
            throw { title: "Whoa! Stop right there", titleDescription: "Try logging in first", message: "Looks like you don't have access to the requested data. Only general data is available for retrieving without logging in", technicalMessage: "Requested access to a non-general entity" };
        } else {
            const items = await getRepository(generalEntities[tableName]).find();
            if (items.length > 0) {
                return items;
            } else {
                throw { title: "Isn't it empty", titleDescription: "Add some items first", message: "Looks like the table you are requesting doesn't have any items in it", technicalMessage: "Requested an empty table" };
            }
        }
    }
}

export class SessionController {
    static async createSession(session, username: string, cellCombination: string) {
        const user = await UserController.getUserByUsername(username);

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
    static async getPermission(roleId: number, moduleId: number) {
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

    static async getPermissionsForRole(roleId: number) {
        const permissions = await getRepository(Permission).find({
            where: {
                roleId: roleId
            },
            relations: ["role", "module"]
        });

        if (permissions) {
            return permissions;
        } else {
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "Looks like your role doesn't have any permissions", technicalMessage: "No permissions for role" };
        }
    }

    static async checkOperation(userId: number, moduleSelector: number|string, operationName: string) {
        if (typeof moduleSelector === "string") {
            const module = await getRepository(Module).findOne({
                where: {
                    name: moduleSelector
                }
            });
            moduleSelector = module.id;
        }

        const user = await UserController.getUser(userId);
        const permission = await PermissionController.getPermission(user.role.id, moduleSelector);

        const operationIndexMap = {
            create: 0,
            retrieve: 1,
            update: 2,
            delete: 3
        }

        if (permission.value[operationIndexMap[operationName]] === "1") {
            return true;
        } else {
            throw { title: "Whoa! Stop right there", titleDescription: "Contact your system administrator", message: `Looks like you don't have permissions to ${operationName} items in the current module`, technicalMessage: "Operation permissions denied" };
        }
    }

    static async getPermittedOperations(userId: number, moduleId: number) {
        const user = await UserController.getUser(userId);
        const permission = await PermissionController.getPermission(user.role.id, moduleId);

        const permittedOperations = [];

        if (permission.value[0] === "1") {
            permittedOperations.push("create");
        }
        if (permission.value[1] === "1") {
            permittedOperations.push("retrieve");
        }
        if (permission.value[2] === "1") {
            permittedOperations.push("update");
        }
        if (permission.value[3] === "1") {
            permittedOperations.push("delete");
        }

        if (permittedOperations.length > 0) {
            return permittedOperations;
        } else {
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "Looks like you don't have any permissions to the this module. Usually the system won't show such modules to the user", technicalMessage: "No permitted operations for module" };
        }
    }

    static async getPermittedModules(userId: number) {
        const user = await UserController.getUser(userId);
        const permissions = await PermissionController.getPermissionsForRole(user.role.id);

        //NOTE: Permitted modules are the ones that have "retrieve" permissions
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
}

export class UserController {
    static async createUser(username: string, user: User) {
        // //Finalize user object
        // user.username = username;
        // user.hash = crypto.createHash("sha256").update(`${username} : A9E5I1`).digest("hex");
        // user.profileImage = fs.readFileSync("../../public/images/icon_user_default.png");
        // user.isNewUser = 1;
        // //Create the directory for private storage
        // if (!fs.existsSync(`../../private/${username}`)) {
        //     fs.mkdirSync(`../../private/${username}`);
        // }
        // return getRepository(User).save(user);
    }

    static async getUser(userId: number) {
        const user = await getRepository(User).findOne({
            where: {
                id: userId
            },
            relations: ["role", "userPreference", "userPreference.theme"]
        });

        if (user) {
            return user;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find a user that matches arguments you provided", technicalMessage: "No user for given arguments" };
        }
    }

    static async getUserByUsername(username: string) {
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

    static async searchUsers(keyword: string) {
        const users = await UserRepository.searchUsers(keyword);

        if (users.length > 0) {
            return users;
        } else {
            throw { title: "Hmmm... couldn't find anyone", titleDescription: "Try single words instead of phrases", message: "There is no user matching the keyword you provided", technicalMessage: "No users for given keyword" };
        }
    }

    static async deleteUser(username) {
        // return DAO.GeneralDAO.deleteRowsByExactMatch("user", "username", username);
    }
}

export class UserPreferenceController {
    static async createUserPreference(username) {
        // //Create and Finalize preference object
        // const preference = {
        //     username: username,
        //     themeId: 1,
        //     name: username
        // };
        // return DAO.GeneralDAO.createRow("userPreference", Object.keys(preference), Object.values(preference));
    }

    static async getUserPreference(username) {
        // const preferences = await DAO.GeneralDAO.getRows("userPreference", [["username", "true", username]], "");
        // if (preferences.length === 0) {
        //     throw { title: "Hmm...Something's wrong", titleDescription: "Recheck to username", message: "We couldn't find a set of preferences for the username that you sent. Make sure that the username is correct and try again", technicalMessage: "Cannot find user" };
        // } else {
        //     return preferences[0];
        // }
    }

    static async deleteUserPreference(username) {
        // return DAO.GeneralDAO.deleteRowsByExactMatch("userPreference", "username", username);
    }
}

//GLOBAL VARIABLES FOR VALIDATION
const regExpLibrary = JSON.parse(fs.readFileSync("./public/registry/library_regExp.json", "utf-8"));

export class ValidationController {
    static async getValidationExpressions(moduleName) {
        // return regExpLibrary[moduleName];
    }

    static async validateUserCreation(username = "", user = {}, userModulePermissions = [{}]) {
        // //Check major: Username is invalid
        // if (!(new RegExp(regExpLibrary.User.username).test(username))) {
        //     throw { title: "Oops! Invalid username", titleDescription: "Make sure the username is valid", message: "A username must only contain a-z, A-Z, 0-9 and optionally a single whitespace in between", technicalMessage: "Invalid username" };
        // }
        // //Check major: User already exists
        // if ((await DAO.GeneralDAO.getRows("user", [["username", "true", username]], "")).length !== 0) {
        //     throw { title: "Already taken", titleDescription: "Try a different username", message: "A user already exists with the username that you are trying to create. Since usernames must be unique, you cannot use an existing one", technicalMessage: "User already exists" };
        // }
        // //Check major: No userModulePermissions
        // if (userModulePermissions.length === 0) {
        //     throw { title: "Forgot permissions?", titleDescription: "Give the user some permissions", message: "A user is someone who have at least one operation permission on a module. If there are no permissions there is no use of the user", technicalMessage: "No permissions for user" };
        // }
        // //Check minor: user.roleId doesn't exist or invalid
        // //Check minor: userModulePermission.moduleId and userModulePermission.permissions doesn't exist or invalid

        // //All cases passed
        // return true;
    }
}

//GLOBAL VARIABLES FOR FILE
const extensionsLibrary = JSON.parse(fs.readFileSync("./public/registry/library_extensions.json", "utf-8"));
const audioExtensions = Object.keys(extensionsLibrary.audioExtensions);
const imageExtensions = Object.keys(extensionsLibrary.imageExtensions);
const videoExtensions = Object.keys(extensionsLibrary.videoExtensions);
const containerExtensions = Object.keys(extensionsLibrary.containerExtensions);
const textExtensions = Object.keys(extensionsLibrary.textExtensions);

export class FileController {
    static async getExtensionsLibrary() {
        return extensionsLibrary;
    }

    static async getItemPaths(userId: number, subDirectoryPath: string) {
        const fullRelativeDirectoryPath = `./private/${userId}/${subDirectoryPath}`;
        if (!fs.existsSync(fullRelativeDirectoryPath)) {
            throw { title: "What directory now?", titleDescription: "Recheck the directory path", message: "We couldn't find a directory for the path you sent. Make sure that the path is correct and try again", technicalMessage: "Requested directory doesn't exist" };
        } if (fs.statSync(fullRelativeDirectoryPath).isFile()) {
            throw { title: "Files aren't directories!", titleDescription: "Make sure the path leads to a directory", message: "We couldn't find a directory for the path you sent. It leads to a file. Make sure that the path is correct and try again", technicalMessage: "Found a file at directory path" };
        } else {
            const itemNames = fs.readdirSync(fullRelativeDirectoryPath);
            const directories = [];
            const files = [];
            for (const itemName of itemNames) {
                const stats = fs.statSync(`${fullRelativeDirectoryPath}/${itemName}`);
                if (stats.isDirectory()) {
                    const directory = {
                        //A "/" will be appended to every directory name
                        name: itemName + "/"
                    };
                    directories.push(directory);
                } else {
                    const fileExtension = itemName.slice(itemName.lastIndexOf(".")).toLowerCase();
                    const file = {
                        name: itemName,
                        size: stats.size,
                        type: null,
                        extensionCategory: null,
                        extension: fileExtension
                    };
                    if (audioExtensions.includes(fileExtension)) {
                        file.type = extensionsLibrary.audioExtensions[fileExtension].fileType;
                        file.extensionCategory = "audioExtensions";
                    } else if (imageExtensions.includes(fileExtension)) {
                        file.type = extensionsLibrary.imageExtensions[fileExtension].fileType;
                        file.extensionCategory = "imageExtensions";
                    } else if (videoExtensions.includes(fileExtension)) {
                        file.type = extensionsLibrary.videoExtensions[fileExtension].fileType;
                        file.extensionCategory = "videoExtensions";
                    } else if (containerExtensions.includes(fileExtension)) {
                        file.type = extensionsLibrary.containerExtensions[fileExtension].fileType;
                        file.extensionCategory = "containerExtensions";
                    } else if (textExtensions.includes(fileExtension)) {
                        file.type = extensionsLibrary.textExtensions[fileExtension].fileType;
                        file.extensionCategory = "textExtensions";
                    } else {
                        file.type = extensionsLibrary.unknownExtensions.unknownExtension.fileType;
                        file.extensionCategory = "unknownExtensions";
                        file.extension = "unknownExtension";
                    }
                    files.push(file);
                }
            }
            return {
                directories: directories,
                files: files
            };
        }
    }

    static async getFileBuffer(userId: number, filePath: string) {
        const fullRelativeDirectoryPath = `./private/${userId}/${filePath}`;
        if (!fs.existsSync(fullRelativeDirectoryPath)) {
            throw { title: "What file now?", titleDescription: "Recheck the file path", message: "We couldn't find a file for the path you sent. Make sure that the path is correct and try again", technicalMessage: "Requested file doesn't exist" };
        } else if (fs.statSync(fullRelativeDirectoryPath).isDirectory()) {
            throw { title: "Directories aren't files!", titleDescription: "Make sure the path leads to a file", message: "We couldn't find a file for the path you sent. It leads to a directory. Make sure that the path is correct and try again", technicalMessage: "Found a directory at file path" };
        } else {
            return fs.readFileSync(fullRelativeDirectoryPath);
        }
    }
}

console.log("Controller status: Ready");