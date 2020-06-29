import * as crypto from "crypto";

import { UserController } from "./UserController";

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