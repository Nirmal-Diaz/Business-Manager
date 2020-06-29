import "reflect-metadata";

import * as express from "express";
import * as fs from "fs";
import * as path from "path";

export const musixRouter = express.Router();

/*
=====================================================================================
musixRouter: Middleware Setup
=====================================================================================
*/
//Set static directory for music files
if (process.platform === "android") {
    musixRouter.use(express.static("/storage/3ACD-101B/Music"));
} else if (process.platform === "linux") {
    musixRouter.use(express.static("/home/assassino/Music"));
} else if (process.platform === "win32") {
    musixRouter.use(express.static("C:/Users/assassino/Music"));
}
/*
=====================================================================================
musixRouter: Route Handlers Setup
=====================================================================================
*/
musixRouter.route("/")
    .all((req, res) => {
        res.sendFile(path.resolve(__dirname + "/../../../public/layouts/musix/index.html"));
    });

//EXPRESS ROUTING: NON-USER PATHS
musixRouter.route("/playlists")
    .get((req, res) => {
        res.json({
            status: true,
            data: JSON.parse(fs.readFileSync("src/registries/musix/playlists.json", "utf-8"))
        });
    })
    .patch(express.json(), (req, res) => {
        fs.writeFileSync("src/registries/musix/playlists_backup.json", fs.readFileSync("src/registries/musix/playlists.json", "utf-8"));
        fs.writeFileSync("src/registries/musix/playlists.json", JSON.stringify(req.body.playlists, null, "    "));

        res.json({
            status: true
        });
    })
    .put((req, res) => {
        const directoryPath = req.query.directoryPath.toString();

        if (!directoryPath.startsWith("/storage/emulated/") && directoryPath.includes("/..")) {
            res.json({
                status: false,
                serverError: {
                    message: "For security reasons, specified path isn't allowed. Path must start with '/storage/emulated/'"
                }
            });
        } else {
            if (fs.existsSync(directoryPath)) {
                if (fs.statSync(directoryPath).isDirectory()) {
                    musixRouter.use(express.static(directoryPath));
    
                    const supportedExtensions = [".mp3", ".wav"];
                    const itemNames = fs.readdirSync(directoryPath);
    
                    const playlist = {
                        name: directoryPath.slice(directoryPath.lastIndexOf("/") + 1),
                        themeColor: "limegreen",
                        tracks: []
                    };
    
                    for (const itemName of itemNames) {
                        const itemExtension = itemName.slice(itemName.lastIndexOf("."));
                        if (supportedExtensions.includes(itemExtension)) {
                            const track = {
                                path: itemName.slice(itemName.lastIndexOf("/") + 1),
                                artist: "",
                                title: "",
                                lyricsURI: null
                            };
    
                            playlist.tracks.push(track);
                        }
                    }
    
                    if (playlist.tracks.length > 0) {
                        res.json({
                            status: true,
                            data: playlist
                        });
                    } else {
                        res.json({
                            status: false,
                            serverError: {
                                message: "No supported items found within the directory"
                            }
                        });
                    }
                } else {
                    res.json({
                        status: false,
                        serverError: {
                            message: "The specified directory path doesn't point to a directory"
                        }
                    });
                }
    
            } else {
                res.json({
                    status: false,
                    serverError: {
                        message: "The specified directory path cannot be found"
                    }
                });
            }
        }
    });

musixRouter.route("/lyrics/:lyricsFileName")
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + "/../../registries/musix/lyrics/" + req.params.lyricsFileName));
    });