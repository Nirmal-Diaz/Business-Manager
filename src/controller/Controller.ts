import { getRepository, createConnection, Connection, getConnection, Like } from "typeorm";
import { User } from "../entity/User";
import { UserModulePermission } from "../entity/UserModulePermission";
import { PermissionRepository, UserRepository } from "../repository/Repository";
import { Role } from "../entity/Role";
import { Module } from "../entity/Module";

//CORE MODULES
const crypto = require("crypto");
const fs = require("fs");
const DAO = require("../repository/Repository.ts");

export class GeneralController {
    static async createItems(tableName, rowData) {
        // for (let i = 0; i < rowData.length; i++) {
        //     await DAO.GeneralDAO.createRow(tableName, Object.keys(rowData[i]), Object.values(rowData[i]))
        //     .catch(error => {
        //         throw error;
        //     });
        // }
        // return true;
    }

    static async getItems(tableName: string, restrictNonGeneralData: boolean) {
        const generalEntities = {
            role: Role,
            module: Module
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

    static async deleteItems(tableName, columnName, columnData) {
        // for (let i = 0; i < columnData.length; i++) {
        //     await DAO.GeneralDAO.deleteRowsByExactMatch(tableName, columnName, columnData[i])
        // }
        // return true;
    }
}

export class SessionController {
    static async createSession(session, username: string, cellCombination: string) {
        const user = await UserController.getUserByUsername(username);

        const generatedHash = crypto.createHash("sha256").update(`${username} : ${cellCombination}`).digest("hex");

        if (user.hash === generatedHash) {
            session.logged = true;
            session.userId = user.userId;
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
    static async createPermissions(username, userModulePermissions) {
        // //Finalize each userModulePermission by adding username property into every userModulePermission
        // for (let i = 0; i < userModulePermissions.length; i++) {
        //     userModulePermissions[i].username = username;
        // }
        // return GeneralController.createItems("userModulePermission", userModulePermissions);
    }

    static async checkOperationPermissions(userId, moduleName, moduleOperationName) {
        const userModulePermission = await PermissionRepository.getPermissionsForModule(userId, moduleName);
        if (userModulePermission) {
            const operationIndexMap = {
                create: 0,
                retrieve: 1,
                update: 2,
                delete: 3
            }
    
            if (userModulePermission.permissions[operationIndexMap[moduleOperationName]] === "1") {
                return true;
            } else {
                throw { title: "Whoa! Stop right there", titleDescription: "Contact your system administrator", message: "Looks like you don't have permissions to the operation to be executed on the current module", technicalMessage: "Operation permissions denied" };
            }
        } else {
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "We couldn't find any record of the queried permission data", technicalMessage: "No records about operation permissions on module" };
        }
    }

    static async getPermittedOperations(userId: number, moduleName: string) {
        const userModulePermission = await PermissionRepository.getPermissionsForModule(userId, moduleName);
        if (userModulePermission) {
            const permittedModuleOperations = [];
    
            if (userModulePermission.permissions[0] === "1") {
                permittedModuleOperations.push("create");
            }
            if (userModulePermission.permissions[1] === "1") {
                permittedModuleOperations.push("retrieve");
            }
            if (userModulePermission.permissions[2] === "1") {
                permittedModuleOperations.push("update");
            }
            if (userModulePermission.permissions[3] === "1") {
                permittedModuleOperations.push("delete");
            }

            return permittedModuleOperations;
        } else {
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "Looks like you don't have any permissions to the current module. Usually the system won't show such modules to the user", technicalMessage: "Since no permitted operations for the module, access to the module is denied" };
        }
    }

    static async getRetrievableModulePaths(userId) {
        const userModulePermissions = await getRepository(UserModulePermission).find({
            where: {
                userId: userId
            },
            relations: ["module"]
        });

        if (userModulePermissions.length > 0) {
            const retrievableModulePaths = [];

            for (let i = 0; i < userModulePermissions.length; i++) {
                if (userModulePermissions[i].permissions[1] === "1") {
                    retrievableModulePaths.push(userModulePermissions[i].module.modulePath);
                }
            }

            return retrievableModulePaths;
        } else {
            throw { title: "Well, that's odd", titleDescription: "Contact your system administrator", message: "Looks like you don't have any modules that have retrieve access. Since every user must have at least a single module with retrieve access, this must be a database error", technicalMessage: "No record about retrievable modules" };
        }
    }

    static async deleteAllPermissions(username) {
        // return DAO.GeneralDAO.deleteRowsByExactMatch("userModulePermission", "username", username);
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
                userId: userId
            },
            relations: ["role", "userPreference", "userPreference.theme"]
        });

        if (user) {
            return user;
        } else {
            throw { title: "Hmmm... we couldn't find that user", titleDescription: "Please recheck your parameters", message: "There is no user matching the parameters you provided", technicalMessage: "No user for given parameters" };
        }
    }

    static async getUserByUsername(username: string) {
        const user = await getRepository(User).findOne({
            where: {
                username: username
            }
        });

        if (user) {
            return user;
        } else {
            throw { title: "Hmmm... we couldn't find you", titleDescription: "Please recheck your credentials", message: "There is no user matching the credentials you provided", technicalMessage: "No user for given credentials" };
        }
    }

    static async searchUsers(keyword) {
        const users = await UserRepository.searchUsers(keyword);

        if (users.length > 0) {
            return users;
        } else {
            throw { title: "Hmmm... couldn't find anyone", titleDescription: "Try wrods instead of phrases", message: "There is no user matching the keyword you provided", technicalMessage: "No users for given keyword" };
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

    static async getItemPaths(userId, subDirectoryPath) {
        const fullRelativeDirectoryPath = `./private/${userId}/${subDirectoryPath}`;
        if (!fs.existsSync(fullRelativeDirectoryPath)) {
            throw { title: "What directory now?", titleDescription: "Recheck the directory path", message: "We couldn't find a directory for the path you sent. Make sure that the path is correct and try again", technicalMessage: "Requested directory doesn't exist" };
        } if (fs.statSync(fullRelativeDirectoryPath).isFile()) {
            throw { title: "Files aren't directories!", titleDescription: "Make sure the path leads to a directory", message: "We couldn't find a directory for the path you sent. It leads to a file. Make sure that the path is correct and try again", technicalMessage: "Found a file at directory path" };
        } else {
            const itemNames = fs.readdirSync(fullRelativeDirectoryPath);
            const directoryData = [];
            const fileData = [];
            for (const itemName of itemNames) {
                const stats = fs.statSync(`${fullRelativeDirectoryPath}/${itemName}`);
                if (stats.isDirectory()) {
                    const directoryDatum = {
                        //A "/" will be appended to every directory name
                        name: itemName + "/"
                    };
                    directoryData.push(directoryDatum);
                } else {
                    const fileExtension = itemName.slice(itemName.lastIndexOf(".")).toLowerCase();
                    const fileDatum = {
                        name: itemName,
                        size: stats.size,
                        fileType: null,
                        fileExtensionCategory: null,
                        fileExtension: fileExtension
                    };
                    if (audioExtensions.includes(fileExtension)) {
                        fileDatum.fileType = extensionsLibrary.audioExtensions[fileExtension].fileType;
                        fileDatum.fileExtensionCategory = "audioExtensions";
                    } else if (imageExtensions.includes(fileExtension)) {
                        fileDatum.fileType = extensionsLibrary.imageExtensions[fileExtension].fileType;
                        fileDatum.fileExtensionCategory = "imageExtensions";
                    } else if (videoExtensions.includes(fileExtension)) {
                        fileDatum.fileType = extensionsLibrary.videoExtensions[fileExtension].fileType;
                        fileDatum.fileExtensionCategory = "videoExtensions";
                    } else if (containerExtensions.includes(fileExtension)) {
                        fileDatum.fileType = extensionsLibrary.containerExtensions[fileExtension].fileType;
                        fileDatum.fileExtensionCategory = "containerExtensions";
                    } else if (textExtensions.includes(fileExtension)) {
                        fileDatum.fileType = extensionsLibrary.textExtensions[fileExtension].fileType;
                        fileDatum.fileExtensionCategory = "textExtensions";
                    } else {
                        fileDatum.fileType = extensionsLibrary.unknownExtensions.unknownExtension.fileType;
                        fileDatum.fileExtensionCategory = "unknownExtensions";
                        fileDatum.fileExtension = "unknownExtension";
                    }
                    fileData.push(fileDatum);
                }
            }
            return [directoryData, fileData];
        }
    }

    static async getFileBuffer(userId, filePath) {
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