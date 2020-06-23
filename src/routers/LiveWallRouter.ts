import "reflect-metadata";

import * as express from "express";
import * as fs from "fs";

export const liveWallRouter = express.Router();

liveWallRouter.route("/")
    .get((req, res) => {
        res.sendFile(__dirname + "/public/layouts/index.html");
    });

liveWallRouter.route("/directories")
    .get((req, res) => {
        const directoryPath = req.query.rootDirectoryPath + req.query.subdirectoryPath;

        if (fs.existsSync(directoryPath)) {
            //Case: Specified directory path exists

            //Read directory
            const itemNames = fs.readdirSync(directoryPath);
            
            //Populate subDirectoryPaths
            const subdirectoryPaths = [];
            for (const itemName of itemNames) {
                //NOTE: Directory paths contain a "/" at the end. Therefore it should be removed before appending anything
                const itemPath = `${directoryPath.slice(0, -1)}/${itemName}`;
                const itemStats = fs.statSync(itemPath);
                if (itemStats.isDirectory()) {
                    //NOTE: Directory paths must contain a "/" at the end
                    //NOTE: rootDirectoryPath substring must be replaced with an empty string
                    const subDirectoryPath = itemPath.replace(req.query.rootDirectoryPath, "") + "/";
                    //NOTE: Directories that start with "." must be excluded for security purposes
                    if (!subDirectoryPath.startsWith(".")) {
                        subdirectoryPaths.push(subDirectoryPath);
                    }
                }
            }

            //Check if subdirectoryPaths contains any data
            if (subdirectoryPaths.length > 0) {
                res.json({
                    status: true,
                    data: subdirectoryPaths
                });
            } else {
                res.json({
                    status: false,
                    error: "No subdirectories are found within this directory"
                });
            }

        } else {
            //Case: Specified directory path doesn't exist
            res.json({
                status: false,
                error: "Specified directory doesn't exist"
            });
        }
    });

liveWallRouter.route("/files/imageMetadata")
    .get((req, res) => {
        const supportedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
        const directoryPath = req.query.rootDirectoryPath + req.query.subdirectoryPath;
        if (fs.existsSync(directoryPath)) {
            //Case: Specified directory path exists

            //Populate imageFileData
            const imageFileData = [];
            (function readContentRecursively(directoryPath) {
                //Read directory
                const itemNames = fs.readdirSync(directoryPath);
                for (let i = 0; i < itemNames.length; i++) {
                    //NOTE: Directory paths contain a "/" at the end. Therefore it should be removed before appending anything
                    const itemPath = `${directoryPath.slice(0, -1)}/${itemNames[i]}`;
                    if (fs.statSync(itemPath).isDirectory()) {
                        //NOTE: Directory paths must contain a "/" at the end
                        readContentRecursively(itemPath + "/");
                    } else {
                        const fileExtension = itemNames[i].slice(itemNames[i].indexOf(".")).toLowerCase();
                        if (supportedExtensions.includes(fileExtension)) {
                            const imageFileDatum = {
                                //NOTE: rootDirectoryPath substring must be replaced with an empty string
                                path: itemPath.replace(req.query.rootDirectoryPath, "")
                            };
                            imageFileData.push(imageFileDatum);
                        }
                    }
                }
            })(directoryPath);

            //Check if imageFileData contains any data
            if (imageFileData.length > 0) {
                res.json({
                    status: true,
                    data: imageFileData
                });
            } else {
                res.json({
                    status: false,
                    error: "No supported image files found within the specified directory"
                });
            }

        } else {
            //Case: Specified directory path doesn't exist
            res.json({
                status: false,
                error: "Specified directory doesn't exist"
            });
        }
    });

liveWallRouter.route("/environments")
    .put((req, res) => {
        if (fs.existsSync(req.query.rootDirectoryPath)) {
            //Case: Specified directory path exists

            //Merge the specified directory with the current static directory
            //WARNING: This line merges the current static directory with the specified one
            liveWallRouter.use(express.static(req.query.rootDirectoryPath));

            res.json({
                status: true
            });

        } else {
            //Case: Specified directory path doesn't exist
            res.json({
                status: false,
                error: "Specified directory doesn't exist. Please specify a valid directory path"
            });
        }
    });