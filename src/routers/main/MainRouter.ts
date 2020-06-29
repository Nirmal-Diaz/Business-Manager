import "reflect-metadata";

import * as path from "path";

import * as express from "express";
import { createConnection } from "typeorm";

import { SessionController } from "../../controllers/main/SessionController";
import { UserController } from "../../controllers/main/UserController";
import { TableController } from "../../controllers/main/TableController";
import { RegistryController } from "../../controllers/main/RegistryController";
import { PermissionController } from "../../controllers/main/PermissionController";
import { EmployeeController } from "../../controllers/main/EmployeeController";
import { RoleController } from "../../controllers/main/RoleController";
import { FileController } from "../../controllers/main/FIleController";

export const mainRouter = express.Router();
/*
=====================================================================================
typeORM: Connection Setup
=====================================================================================
*/
createConnection().then(() => {
    console.log("Connection status: Successful");
}).catch((error) => {
    console.error(error);
});
/*
=====================================================================================
mainRouter: Middleware Setup (Pre routing)
=====================================================================================
*/
//Set static directory
mainRouter.use(express.static(__dirname + "/../../../public"));

//Initialize login validator
mainRouter.use((req, res, next) => {
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
mainRouter: Route Handlers Setup
=====================================================================================
*/
mainRouter.route("/")
    .all((req, res) => {
        res.sendFile(path.resolve(__dirname + "/../../../public/layouts/main/index.html"));
    });

mainRouter.route("/sessions")
    .get((req, res, next) => {
        SessionController.checkLogIn(req.session).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    })
    .put(express.json(), (req, res, next) => {
        SessionController.createOne(req.session, req.body.username, req.body.cellCombination).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

mainRouter.route("/sessions/@me")
    .delete((req, res, next) => {
        req.session.destroy(() => {
            res.locals.data = true; next();
        });
    });

mainRouter.route("/users/:username/avatar")
    .get((req, res, next) => {
        UserController.getOneByUsername(req.params.username).then(data => {
            res.locals.data = data.userPreference.avatar; next();
        }).catch(error => {
            res.locals.error = error; next();
        })
    });

/* 
=====================================================================================
mainRouter: Route Handlers Setup (Only login validation)
=====================================================================================
*/
mainRouter.route("/tables/:tableName")
    .get((req, res, next) => {
        TableController.getMany(req.params.tableName).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

mainRouter.route("/registries/:registryFile")
    .get((req, res, next) => {
        RegistryController.getParsedRegistry(req.params.registryFile).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

/* 
=====================================================================================
mainRouter: Route Handlers Setup (Both login and permission validation)
=====================================================================================
*/
//EMPLOYEES
mainRouter.route("/employees")
    .put(express.json(), (req, res, next) => {
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

mainRouter.route("/employees/:employeeId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "employees", req.method)
            .then(() => EmployeeController.getOne(parseInt(req.params.employeeId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json(), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "employees", req.method)
            .then(() => EmployeeController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "employees", req.method)
            .then(() => EmployeeController.deleteOne(parseInt(req.params.employeeId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//USERS
mainRouter.route("/users")
    .put(express.json(), (req, res, next) => {
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
    });

mainRouter.route("/users/:userId")
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
    })
    .post(express.json(), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "users", req.method)
            .then(() => UserController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "users", req.method)
            .then(() => {
                if (parseInt(req.params.userId) === req.session.userId) {
                    throw { title: "Cannot delete self", titleDescription: "Ask another user to delete you", message: "You are logged in as the user you are trying to delete. You cannot delete a user when logged in as that user. You can log in as another user to delete this user", technicalMessage: "Attempted self user deletion" };
                } else {
                    return UserController.deleteOne(parseInt(req.params.userId));
                }
            })
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//PERMISSIONS AND ROLES
mainRouter.route("/users/:userId/modules")
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

mainRouter.route("/users/:userId/modules/:moduleId")
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

mainRouter.route("/roles")
    .put(express.json(), (req, res, next) => {
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

mainRouter.route("/roles/:roleId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => RoleController.getOne(parseInt(req.params.roleId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json(), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => RoleController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => RoleController.deleteOne(parseInt(req.params.roleId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/permissions")
    .put(express.json(), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => PermissionController.cerateMany(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/permissions/:roleId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => PermissionController.getManyByRole(parseInt(req.params.roleId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json(), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "permissions", req.method)
            .then(() => PermissionController.updateMany(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//FILES AND DIRECTORIES
mainRouter.route("/directories/:subDirectoryPath")
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.deleteDirectory(path.normalize(`${req.session.userId}/${req.params.subDirectoryPath}`))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/directories/:subDirectoryPath/items")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.readDirectory(path.normalize(`${req.session.userId}/${req.params.subDirectoryPath}`))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/directories/:subDirectoryPath/files/:fileName")
    .get((req, res, next) => {
        const resolvedPath = path.resolve(`${FileController.absolutePrivateDirectoryPath +req.session.userId}/${req.params.subDirectoryPath + req.params.fileName}`);

        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.isPathExists(resolvedPath))
            .then(() => FileController.isPathFile(resolvedPath))
            .then(() => {
                res.sendFile(resolvedPath);
            })
            .catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "files", req.method)
            .then(() => FileController.deleteFile(path.normalize(`${req.session.userId}/${req.params.subDirectoryPath + req.params.fileName}`))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

/*
=====================================================================================
mainRouter: Middleware Setup (Post routing)
=====================================================================================
*/
//Initiate handler for successful responses
mainRouter.use((req, res, next) => {
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
mainRouter.use((req, res, next) => {
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