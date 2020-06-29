import * as fs from "fs";
import * as crypto from "crypto";

import { getRepository } from "typeorm";

import { UserPreference } from "../../entities/main/UserPreference";
import { User } from "../../entities/main/User";

export class UserPreferenceController {
    static async createOne(user: User) {
        //Create userPreference with system defaults
        const newUserPreference = new UserPreference();
        newUserPreference.userId = user.id;
        newUserPreference.hash = crypto.createHash("sha256").update(`${user.username} : A9E5I1`).digest("hex");
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