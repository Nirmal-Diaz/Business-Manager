import "reflect-metadata";

import * as express from "express";
import * as session from "express-session";

import {
    UserController,
    SessionController,
    PermissionController,
    TableController,
    FileController,
    RegistryController,
    RoleController,
    EmployeeController
} from "./src/controllers/Controller";
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
Express.js: Middleware Setup (Pre routing)
=====================================================================================
*/
//Cache JSON parser
const jsonParser = express.json();

//Set static directory
app.use(express.static("./public"));

//Initiate session
app.use(session({
    secret: Math.random().toString(),
    saveUninitialized: false,
    resave: false
}));

//Initialize login validator
app.use((req, res, next) => {
    if (["/", "/sessions"].includes(req.path) || /^\/users\/.*\/avatar$/.test(req.path)) {
        //Case: Path must be excluded
        next();
    } else {
        //Case: Path must be included
        SessionController.checkLogIn(req.session).then(() => {
            next();
        }).catch(error => {
            console.log("System error resolved:", error);
            res.json({
                status: false,
                error: error
            });
        });
    }
});
/* 
=====================================================================================
Express.js: Routing (No validation)
=====================================================================================
*/
app.route("/")
    .all((req, res) => {
        res.sendFile(__dirname + "/public/index.html");
    });

app.route("/sessions")
    .get((req, res, next) => {
        SessionController.checkLogIn(req.session).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    })
    .put(jsonParser, (req, res, next) => {
        SessionController.createOne(req.session, req.body.username, req.body.cellCombination).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    })
    .delete((req, res, next) => {
        req.session.destroy(() => {
            res.locals.data = true; next();
        });
    });

//TODO: Change path to honor REST
app.route("/users/:username/avatar")
    .get((req, res, next) => {
        UserController.getOneByUsername(req.params.username).then(data => {
            res.locals.data = data.userPreference.avatar; next();
        }).catch(error => {
            res.locals.error = error; next();
        })
    });

/* 
=====================================================================================
Express.js: Routing (Only login validation)
=====================================================================================
*/
app.route("/tables/:tableName")
    .get((req, res, next) => {
        TableController.getMany(req.params.tableName).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

app.route("/registries/:registryFile")
    .get((req, res, next) => {
        RegistryController.getFile(req.params.registryFile).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });
/* 
=====================================================================================
Express.js: Routing (Both login and permission validation)
=====================================================================================
*/
//EMPLOYEES
app.route("/employees")
    .put(jsonParser, (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "employees", req.method)
            .then(() => EmployeeController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "employees", req.method)
            .then(() => EmployeeController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//USERS
app.route("/users/:userId")
    .get((req, res, next) => {
        (() => {
            if (req.params.userId === "@me") {
                return UserController.getOne(req.session.userId);
            } else {
                return PermissionController.checkPermission(req.session.userId, "users", req.method)
                    .then(() => UserController.getOne(parseInt(req.params.userId)));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

app.route("/users")
    .put(jsonParser, (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "users", req.method)
            .then(() => UserController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "users", req.method)
            .then(() => UserController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
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

//PERMISSIONS AND ROLES
app.route("/users/:userId/modules")
    .get((req, res, next) => {
        (() => {
            if (req.params.userId === "@me") {
                return PermissionController.getPermittedModules(req.session.userId);
            } else {
                return PermissionController.checkPermission(req.session.userId, "permissions", req.method)
                    .then(() => PermissionController.getPermittedModules(parseInt(req.params.userId)));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

app.route("/users/:userId/modules/:moduleId")
    .get((req, res, next) => {
        (() => {
            if (req.params.userId === "@me") {
                return PermissionController.getOneByUser(parseInt(req.session.userId), parseInt(req.params.moduleId));
            } else {
                return PermissionController.checkPermission(req.session.userId, "permissions", req.method)
                    .then(() => PermissionController.getOneByUser(parseInt(req.params.userId), parseInt(req.params.moduleId)));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

app.route("/roles")
    .put(jsonParser, (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => RoleController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => RoleController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

app.route("/permissions")
    .put(jsonParser, (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => PermissionController.cerateMany(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//FILES AND DIRECTORIES
//TODO: Change path to honor REST
app.route("/file/itemPaths")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.getDirectory(req.session.userId, req.query.subDirectoryPath)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//TODO: Change path to honor REST
app.route("/file/fileBuffer")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.getFile(req.session.userId, req.query.filePath)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

/*
=====================================================================================
Express.js: Middleware Setup (Post routing)
=====================================================================================
*/
//Initiate handler for successful responses
app.use((req, res, next) => {
    if (res.locals.data) {
        //Case: res.locales.data is present with data
        //Send data
        res.json({
            status: true,
            data: res.locals.data
        });
    } else {
        //Case: res.locales.data is not present
        next();
    }
});

//Initiate handler for unsuccessful responses
app.use((req, res, next) => {
    //WARNING: This "else" is unnecessary as res.locales.error must be present by now
    if (res.locals.error) {
        //Case: res.locales.error is present with data
        //Send data
        console.log("System error resolved:", res.locals.error);
        res.json({
            status: false,
            error: res.locals.error
        });
    }
})

console.log(`Express server status: Ready. Listening on port ${port}`);