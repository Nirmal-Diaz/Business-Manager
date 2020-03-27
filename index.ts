import "reflect-metadata";

import * as express from "express";
import * as session from "express-session";

import {
    UserController,
    SessionController,
    PermissionController,
    GeneralController,
    FileController,
    RegistryController
} from "./src/controller/Controller";

/** ================================================================================== */

//EXPRESS
const port: number = 8080;
const jsonParser = express.json();
const app = express();
//EXPRESS: SESSION
const sessionMiddleware = session({
    secret: Math.random().toString(),
    saveUninitialized: false,
    resave: false
});
//EXPRESS INITIALIZATION
app.use(express.static("./public"));
app.use(sessionMiddleware);
app.listen(port);

/** ================================================================================== */

//EXPRESS ROUTING (WITH NO VALIDATION)
app.route("/")
    .all((request, response) => {
        response.sendFile(__dirname + "/public/index.html");
    });

app.route("/session")
    .put(jsonParser, (request, response) => {
        SessionController.createSession(request.session, request.body.username, request.body.cellCombination)
            .then(() => {
                response.json({
                    status: true
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    })
    .delete((request, response) => {
        request.session.destroy(() => {
            response.json({
                status: true
            });
        });
    });

/** ================================================================================== */

//EXPRESS ROUTING (WITH LOGIN VALIDATION)
app.route("/workspace")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => {
                response.json({
                    status: true
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/session/currentUser")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => UserController.getUser(request.session.userId))
            .then(data => {
                //Remove hash for security reasons
                data.userPreference.hash = "";
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/permission/permittedModules")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => PermissionController.getPermittedModules(request.session.userId))
            .then(data => {
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/permission/permittedOperations")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => PermissionController.getPermittedOperations(request.session.userId, parseInt(request.query.moduleId)))
            .then(data => {
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/general")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => GeneralController.getItems(request.query.tableName, true))
            .then(data => {
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/registry")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => RegistryController.getFile(request.query.fileName))
            .then(data => {
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

/** ================================================================================== */

//EXPRESS ROUTING (WITH LOGIN + PERMISSION VALIDATION)
app.route("/user")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(async () => {
                //Case: Successfully logged in
                //Return the whole user
                return PermissionController.checkPermission(request.session.userId, "users", "retrieve")
                    .then(() => UserController.getUser(request.session.userId));
            }, async () => {
                //Case: Not logged in
                //Return only the avatar keeping the structure of the user object
                const user = await UserController.getUserByUsername(request.query.username);
                return {
                    userPreference: {
                        avatar: user.userPreference.avatar
                    }
                };
            })
            .then(data => {
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    })
    .put(jsonParser, (request, response) => {
        PermissionController.checkPermission(request.session.userId, "users", "create")
            .then(() => UserController.createUser(request.body.bindingObject))
            .then(() => {
                response.json({
                    status: true
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    })
    .delete(jsonParser, (request, response) => {
        // controller.Permission.checkOperationPermissions(request.session.username, "users", "delete").then(() => {

        // }).then(() => {
        //     response.json({
        //         status: true
        //     });
        // }).catch((error) => {
        //     console.log("System error resolved:", error);
        //     response.json({
        //         status: false,
        //         error: error
        //     });
        // });
    });

app.route("/users")
    .get((request, response) => {
        PermissionController.checkPermission(request.session.userId, "users", "retrieve")
            .then(() => UserController.searchUsers(request.query.keyword))
            .then(data => {
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/file/itemPaths")
    .get((request, response) => {
        PermissionController.checkPermission(request.session.userId, "files", "retrieve")
            .then(() => FileController.getItemPaths(request.session.userId, request.query.subDirectoryPath))
            .then(data => {
                response.json({
                    status: true,
                    data: data
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

app.route("/file/fileBuffer")
    .get((request, response) => {
        PermissionController.checkPermission(request.session.userId, "files", "retrieve")
            .then(() => FileController.getFileBuffer(request.session.userId, request.query.filePath))
            .then(data => {
                response.json({
                    status: true,
                    data: data,
                });
            })
            .catch(error => {
                console.log("System error resolved:", error);
                response.json({
                    status: false,
                    error: error
                });
            });
    });

console.log(`Express server status: Ready. Listening on port ${port}`);