//TYPESCRIPT
import "reflect-metadata";
//CONTROLLERS
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
const express = require("express");
const jsonParser = express.json();
const app = express();
//EXPRESS: SESSION
const session = require("express-session");
const sessionMiddleware = session({
    secret: Math.random().toString(),
    saveUninitialized: false,
    resave: true
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

app.route("/user/retrieve/profileImage")
    .get((request, response) => {
        UserController.getUserByUsername(request.query.username)
            .then(data => {
                response.json({
                    status: true,
                    user: {
                        profileImage: data.profileImage
                    }
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

app.route("/session/create/newSession")
    .put(jsonParser, (request, response) => {
        SessionController.createSession(request.session, request.body.username, request.body.cellCombination)
            .then(() => {
                response.json({
                    status: true
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
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
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

app.route("/session/retrieve/currentUser")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => UserController.getUser(request.session.userId))
            .then(data => {
                response.json({
                    status: true,
                    user: data
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

app.route("/permission/retrieve/permittedModulePaths")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => PermissionController.getRetrievableModulePaths(request.session.userId))
            .then(data => {
                response.json({
                    status: true,
                    retrievableModulePaths: data
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

app.route("/permission/retrieve/permittedModuleOperations")
    .post(jsonParser, (request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => PermissionController.getPermittedOperations(request.session.userId, request.body.moduleName))
            .then(data => {
                response.json({
                    status: true,
                    permittedModuleOperations: data
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

//EXPRESS ROUTING (WITH LOGIN + PERMISSION VALIDATION)
app.route("/general/retrieve/items")
    .get((request, response) => {
        SessionController.checkLogIn(request.session)
            .then(() => GeneralController.getItems(request.query.tableName, true))
            .then(data => {
                response.json({
                    status: true,
                    items: data
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

app.route("/user/create/newUser")
    .put(jsonParser, (request, response) => {
        // PermissionController.checkOperationPermissions(request.session.username, "User", "create")
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
        //     .catch(serverError => {
        //         console.log("System error resolved:", serverError);
        //         response.json({
        //             status: false,
        //             serverError: serverError
        //         });
        //     });
    });

app.route("/user/retrieve/users")
    .get((request, response) => {
        // PermissionController.checkOperationPermissions(request.session.username, "User", "retrieve")
        //     .then(() => UserController.searchUsers(request.query.keyword))
        //     .then(data => {
        //         response.json({
        //             status: true,
        //             users: data
        //         });
        //     })
        //     .catch(serverError => {
        //         console.log("System error resolved:", serverError);
        //         response.json({
        //             status: false,
        //             serverError: serverError
        //         });
        //     });
    });

// app.route("/user/delete/users")
//     .post(jsonParser, (request, response) => {
//         controller.Permission.checkOperationPermissions(request.session.username, "User", "delete").then(() => {

//         }).then(() => {
//             response.json({
//                 status: true
//             });
//         }).catch((serverError) => {
//             console.log("System error resolved:", serverError);
//             response.json({
//                 status: false,
//                 serverError: serverError
//             });
//         });
//     });

app.route("/file/retrieve/extensionsLibrary")
    .get((request, response) => {
        PermissionController.checkOperationPermissions(request.session.userId, "File", "retrieve")
            .then(() => FileController.getExtensionsLibrary())
            .then(data => {
                response.json({
                    status: true,
                    extensionsLibrary: data
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

app.route("/file/retrieve/itemPaths")
    .get((request, response) => {
        PermissionController.checkOperationPermissions(request.session.userId, "File", "retrieve")
            .then(() => FileController.getItemPaths(request.session.userId, request.query.subDirectoryPath))
            .then(data => {
                response.json({
                    status: true,
                    directoryData: data[0],
                    fileData: data[1]
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

app.route("/file/retrieve/fileBuffer")
    .get((request, response) => {
        PermissionController.checkOperationPermissions(request.session.userId, "File", "retrieve")
            .then(() => FileController.getFileBuffer(request.session.userId, request.query.filePath))
            .then(data => {
                response.json({
                    status: true,
                    fileBuffer: data,
                });
            })
            .catch(serverError => {
                console.log("System error resolved:", serverError);
                response.json({
                    status: false,
                    serverError: serverError
                });
            });
    });

console.log(`Express server status: Ready. Listening on port ${port}`);