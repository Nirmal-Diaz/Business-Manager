import * as fs from "fs";

export class RegistryController {
    static async getParsedRegistry(fileName: string) {
        if (/^[a-zA-Z]{1,}[.]{1}json$/.test(fileName)) {
            //fileName is valid and is in the format "someFile.json"
            const fullRelativeFilePath = `./src/registries/main/${fileName}`;
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