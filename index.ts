import "reflect-metadata";

import * as express from "express";
import * as session from "express-session";

import {
    UserController,
    SessionController,
    PermissionController,
    GeneralController,
    FileController
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
                data.hash = "";
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
    .get(jsonParser, (request, response) => {
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

//EXPRESS ROUTING (WITH LOGIN + PERMISSION VALIDATION)
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

app.route("/user")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(async () => {
                return PermissionController.checkOperation(request.session.userId, "users", "retrieve")
                .then(() => UserController.getUser(request.session.userId));
            }, async () => {
                const user = await UserController.getUserByUsername(request.query.username);
                return {
                    avatar: user.avatar
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
        // PermissionController.checkOperationPermissions(request.session.username, "users", "create")
        //     .then(() => ValidationController.validateUserCreation(request.body.username, request.body.user, request.body.userModulePermissions))
        //     //User creation must be done first in order create preferences and permissions
        //     .then(() => UserController.createUser(request.body.username, request.body.user))
        //     .then(() => PermissionController.createPermissions(request.body.username, request.body.userModulePermissions))
        //     .then(() => UserPreferenceController.createUserPreference(request.body.username))
        //     .then(() => {
        //         response.json({
        //             status: true
        //         });
        //     })
        //     .catch(error => {
        //         console.log("System error resolved:", error);
        //         response.json({
        //             status: false,
        //             error: error
        //         });
        //     });
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
        PermissionController.checkOperation(request.session.userId, "users", "retrieve")
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

app.route("/file/extensionsLibrary")
    .get((request, response) => {
        PermissionController.checkOperation(request.session.userId, "files", "retrieve")
            .then(() => FileController.getExtensionsLibrary())
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
        PermissionController.checkOperation(request.session.userId, "files", "retrieve")
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
        PermissionController.checkOperation(request.session.userId, "files", "retrieve")
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