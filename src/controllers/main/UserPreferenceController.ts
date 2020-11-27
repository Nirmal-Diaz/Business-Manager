import * as fs from "fs";
import * as crypto from "crypto";

import { getRepository } from "typeorm";

import { UserPreference } from "../../entities/main/UserPreference";
import { User } from "../../entities/main/User";
import { RegistryController } from "./RegistryController";
import { ValidationController } from "./ValidationController";

export class UserPreferenceController {
    static async createOne(user: User) {
        //Create userPreference with system defaults
        const newUserPreference = new UserPreference();
        newUserPreference.userId = user.id;
        newUserPreference.hash = crypto.createHash("sha256").update("A9E5I1").digest("hex");
        newUserPreference.preferredName = user.username;
        newUserPreference.themeId = 1;
        newUserPreference.avatar = fs.readFileSync("./public/images/main/icon_user_default.png");

        //Create a private storage for user
        if (!fs.existsSync(`./private/${user.id}`)) {
            fs.mkdirSync(`./private/${user.id}`);
        }

        return getRepository(UserPreference).save(newUserPreference).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async getOne(userId: number) {
        const userPreference = await getRepository(UserPreference).findOne({
            where: {
                userId: userId
            },
        });

        if (userPreference) {
            return userPreference;
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find any user preferences that matches your arguments", technicalMessage: "No user preferences for given arguments" };
        }
    }

    static async updateOne(clientBindingObject) {
        const originalObject = await getRepository(UserPreference).findOne({
            userId: clientBindingObject.userId.value
        });

        if (originalObject) {
            const serverObject = await RegistryController.getParsedRegistry("userPreference.json");
            ValidationController.validateBindingObject(serverObject, clientBindingObject);
            ValidationController.updateOriginalObject(originalObject, serverObject);

            return await getRepository(UserPreference).save(originalObject).catch((error) => {
                throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
            });
        } else {
            throw { title: "Oops!", titleDescription: "Please recheck your arguments", message: "We couldn't find any user preferences that matches your arguments", technicalMessage: "No user preferences for given arguments" };
        }
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

    static async updatePattern(userId: number, cellCombination: string) {
        const userPreference = await getRepository(UserPreference).findOne({
            where: {
                userId: userId
            }
        });

        userPreference.hash = crypto.createHash("sha256").update(cellCombination).digest("hex");

        return getRepository(UserPreference).save(userPreference).catch((error) => {
            throw { title: error.name, titleDescription: "Ensure you aren't violating any constraints", message: error.sqlMessage, technicalMessage: error.sql }
        });
    }

    static async checkPattern(userId: number, cellCombination: string) {
        const userPreference = await getRepository(UserPreference).findOne({
            where: {
                userId: userId
            }
        });

        const generatedHash = crypto.createHash("sha256").update(cellCombination).digest("hex");

        if (userPreference.hash === generatedHash) {
            return true;
        } else {
            throw { title: "Oops! Pattern mismatch", titleDescription: "Try again with the correct pattern", message: "", technicalMessage: "Inequivalent hashes" };
        }
    }
}