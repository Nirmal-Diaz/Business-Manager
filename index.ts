import "reflect-metadata";

import * as express from "express";
import * as session from "express-session";

import {
    UserController,
    SessionController,
    PermissionController,
    GeneralController,
    FileController,
    RegistryController,
    RoleController
} from "./src/controller/Controller";
import { request } from "http";
/*
=====================================================================================
Express.js: Setup
=====================================================================================
*/
const port: number = 8080;
const app = express();
app.listen(port);
/*
=====================================================================================
Express.js: Middleware Setup
=====================================================================================
*/
const jsonParser = express.json();

app.use(express.static("./public"));

app.use(session({
    secret: Math.random().toString(),
    saveUninitialized: false,
    resave: false
}));

app.use((req, res, next) => {
    //Skip paths that need no checking
    if (["/", "/session", "/user/avatar"].includes(req.path)) {
        next();
        return;
    }
    
    //Check all other paths for session validation
    SessionController.checkLogIn(req.session).then(() => {
        next();
    }).catch(error => {
        console.log("System error resolved:", error);
        res.json({
            status: false,
            error: error
        });
    });
});
/* 
=====================================================================================
Express.js: Routing (Without permission validation)
=====================================================================================
*/
app.route("/")
    .all((req, res) => {
        res.sendFile(__dirname + "/public/index.html");
    });

app.route("/session")
    .get((req, res) => {
        SessionController.checkLogIn(req.session)
            .then(() => {
                res.json({
                    status: true
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    })
    .put(jsonParser, (req, res) => {
        SessionController.createSession(req.session, req.body.username, req.body.cellCombination)
            .then(() => {
                res.json({
                    status: true
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    })
    .delete((req, res) => {
        req.session.destroy(() => {
            res.json({
                status: true
            });
        });
    });

app.route("/user/avatar")
    .get((req, res) => {
        UserController.getUserByUsername(req.query.username)
            .then(data => {
                res.json({
                    status: true,
                    data: {
                        userPreference: {
                            avatar: data.userPreference.avatar
                        }
                    }
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/session/currentUser")
    .get((req, res) => {
        UserController.getUser(req.session.userId)
            .then(data => {
                //Remove hash for security reasons
                data.userPreference.hash = "";
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/permission/permittedModules")
    .get((req, res) => {
        PermissionController.getPermittedModules(req.session.userId)
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/permission/permittedOperations")
    .get((req, res) => {
        PermissionController.getPermittedOperations(req.session.userId, parseInt(req.query.moduleId))
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/general")
    .get((req, res) => {
        GeneralController.getItems(req.query.tableName, true)
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/registry")
    .get((req, res) => {
        RegistryController.getFile(req.query.fileName)
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });
/* 
=====================================================================================
Express.js: Routing (With permission validation)
=====================================================================================
*/
app.route("/user")
    .get((req, res) => {
        PermissionController.checkPermission(req.session.userId, "users", req.method)
            .then(() => UserController.getUser(req.session.userId))
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            })
    })
    .put(jsonParser, (req, res) => {
        PermissionController.checkPermission(req.session.userId, "users", req.method)
            .then(() => UserController.createUser(req.body.bindingObject))
            .then(() => {
                res.json({
                    status: true
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    })
    .delete(jsonParser, (req, res) => {
        // controller.Permission.checkOperationPermissions(req.session.username, "users", req.method).then(() => {

        // }).then(() => {
        //     res.json({
        //         status: true
        //     });
        // }).catch((error) => {
        //     console.log("System error resolved:", error);
        //     res.json({
        //         status: false,
        //         error: error
        //     });
        // });
    });

app.route("/users")
    .get((req, res) => {
        PermissionController.checkPermission(req.session.userId, "users", req.method)
            .then(() => UserController.search(req.query.keyword))
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/roles")
    .get((req, res) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => RoleController.search(req.query.keyword))
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/file/itemPaths")
    .get((req, res) => {
        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.getItemPaths(req.session.userId, req.query.subDirectoryPath))
            .then(data => {
                res.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/file/fileBuffer")
    .get((req, res) => {
        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.getFileBuffer(req.session.userId, req.query.filePath))
            .then(data => {
                res.json({
                    status: true,
                    data: data,
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                res.json({
                    status: false,
                    error: error
                });
            });
    });

console.log(`Express server status: Ready. Listening on port ${port}`);