import * as fs from "fs";

export class FileController {
    static absolutePrivateDirectoryPath = `${__dirname}/../../../private/`;

    static async isPathExists(absolutePath: string) {
        if (fs.existsSync(absolutePath)) {
            return true;
        } else {
            throw { title: "There's nothing here", titleDescription: "Recheck the path", message: "We couldn't find anything at the path you specified. Make sure that the path is correct and try again", technicalMessage: "Nothing exists at specified path" };
        }
    }

    static async isPathFile(absolutePath: string) {
        if (fs.statSync(absolutePath).isFile()) {
            return true;
        } else {
            throw { title: "Path doesn't lead to a file", titleDescription: "Specify a file path", message: "Path you specified leads doesn't lead to a file. Make sure that the path is correct and leads to a file", technicalMessage: "Cannot find a file at file path" };
        }
    }

    static async isPathDirectory(absolutePath: string) {
        if (fs.statSync(absolutePath).isDirectory()) {
            return true;
        } else {
            throw { title: "Path doesn't lead to a directory", titleDescription: "Specify a directory path", message: "Path you specified leads doesn't lead to a directory. Make sure that the path is correct and leads to a directory", technicalMessage: "Cannot find a directory at directory path" };
        }
    }

    static async readDirectory(relativeDirectoryPath: string) {
        const fullRelativeDirectoryPath = FileController.absolutePrivateDirectoryPath+relativeDirectoryPath;

        return FileController.isPathExists(fullRelativeDirectoryPath)
            .then(() => FileController.isPathDirectory(fullRelativeDirectoryPath))
            .then(() => {
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
            })
            .catch(error => {
                throw error;
            });
    }

    static async deleteDirectory(relativeDirectoryPath: string) {
        const fullRelativeDirectoryPath = FileController.absolutePrivateDirectoryPath+relativeDirectoryPath;

        return FileController.isPathExists(fullRelativeDirectoryPath)
            .then(() => FileController.isPathDirectory(fullRelativeDirectoryPath))
            .then(() => {
                (function deleteDirectoryRecursively(directoryPath: string) {
                    const itemNames = fs.readdirSync(directoryPath);
                    for (const itemName of itemNames) {
                        const itemPath = `${directoryPath}/${itemName}`;
                        const stats = fs.statSync(itemPath);
                        if (stats.isDirectory()) {
                            deleteDirectoryRecursively(itemPath);
                        } else {
                            fs.unlinkSync(itemPath);
                        }
                    }
                    fs.rmdirSync(directoryPath);
                })(fullRelativeDirectoryPath);

                return true;
            })
            .catch(error => {
                throw error;
            });
    }

    static async getFileBuffer(relativeFilePath: string) {
        const fullRelativeFilePath = FileController.absolutePrivateDirectoryPath+relativeFilePath;

        return FileController.isPathExists(fullRelativeFilePath)
            .then(() => FileController.isPathFile(fullRelativeFilePath))
            .then(() => fs.readFileSync(fullRelativeFilePath))
            .catch(error => {
                throw error;
            });
    }

    static async deleteFile(relativeFilePath: string) {
        const fullRelativeFilePath = FileController.absolutePrivateDirectoryPath+relativeFilePath;

        return FileController.isPathExists(fullRelativeFilePath)
            .then(() => FileController.isPathFile(fullRelativeFilePath))
            .then(() => {
                fs.unlinkSync(fullRelativeFilePath);
                return true;
            })
            .catch(error => {
                throw error;
            });
    }
}