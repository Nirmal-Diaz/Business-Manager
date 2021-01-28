import "reflect-metadata";

import * as path from "path";

import * as express from "express";
import * as session from "express-session";
import { createConnection } from "typeorm";

import { SessionController } from "../controllers/main/SessionController";
import { UserController } from "../controllers/main/UserController";
import { TableController } from "../controllers/main/TableController";
import { RegistryController } from "../controllers/main/RegistryController";
import { PermissionController } from "../controllers/main/PermissionController";
import { EmployeeController } from "../controllers/main/EmployeeController";
import { RoleController } from "../controllers/main/RoleController";
import { FileController } from "../controllers/main/FIleController";
import { UserPreferenceController } from "../controllers/main/UserPreferenceController";
import { SupplierController } from "../controllers/main/SupplierController";
import { CustomerController } from "../controllers/main/CustomerController";
import { MaterialController } from "../controllers/main/MaterialController";
import { ProductController } from "../controllers/main/ProductController";
import { MaterialImportRequestController } from "../controllers/main/MaterialImportRequestController";
import { MaterialImportQuotationController } from "../controllers/main/MaterialImportQuotationController";
import { MaterialBatchController } from "../controllers/main/MaterialBatchController";
import { MaterialImportOrderController } from "../controllers/main/MaterialImportOrderController";
import { MaterialImportInvoiceController } from "../controllers/main/MaterialImportInvoiceController";
import { MaterialImportController } from "../controllers/main/MaterialImportController";
import { OutboundPaymentController } from "../controllers/main/OutboundPaymentController";
import { ProductBatchController } from "../controllers/main/ProductBatchController";
import { ProductExportRequestController } from "../controllers/main/ProductExportRequestController";
import { InboundPaymentController } from "../controllers/main/InboundPaymentController";
import { ProductManufacturingInvoiceController } from "../controllers/main/ProductManufacturingInvoiceController";
import { ProductManufacturingOrderController } from "../controllers/main/ProductManufacturingOrderController";
import { ProductExportInvoiceController } from "../controllers/main/ProductExportInvoiceController";
import { ReportsController } from "../controllers/main/ReportsController";

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
//Initiate session
mainRouter.use(session({
    secret: Math.random().toString(),
    saveUninitialized: false,
    resave: false
}));

//Set static directory
mainRouter.use(express.static(__dirname + "/../../public"));

//Initialize login validator
mainRouter.use((req, res, next) => {
    if (["/", "/sessions"].includes(req.path) || /^\/users\/.*\/avatar$/.test(req.path)) {
        //CASE: Path must be excluded
        next();
    } else {
        //CASE: Path must be included
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
        res.sendFile(path.resolve(__dirname + "/../../public/layouts/main/index.html"));
    });

mainRouter.route("/utilities/chartjs")
    .all((req, res) => {
        res.sendFile(path.resolve(__dirname + "/../../node_modules/chart.js/dist/Chart.js"));
    });

mainRouter.route("/sessions")
    .get((req, res, next) => {
        SessionController.checkLogIn(req.session).then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    })
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
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
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
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
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
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

//SUPPLIERS
mainRouter.route("/suppliers")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "suppliers", req.method)
            .then(() => {
                //Add userId to record the created user
                req.body.bindingObject.userId.value = req.session.userId;
                return SupplierController.createOne(req.body.bindingObject);
            }).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "suppliers", req.method)
            .then(() => SupplierController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/suppliers/:supplierId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "suppliers", req.method)
            .then(() => SupplierController.getOne(parseInt(req.params.supplierId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "suppliers", req.method)
            .then(() => SupplierController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "suppliers", req.method)
            .then(() => SupplierController.deleteOne(parseInt(req.params.supplierId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//CUSTOMERS
mainRouter.route("/customers")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "customers", req.method)
            .then(() => {
                //Add userId to record the created user
                req.body.bindingObject.userId.value = req.session.userId;
                return CustomerController.createOne(req.body.bindingObject);
            }).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "customers", req.method)
            .then(() => CustomerController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/customers/:customerId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "customers", req.method)
            .then(() => CustomerController.getOne(parseInt(req.params.customerId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "customers", req.method)
            .then(() => CustomerController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "customers", req.method)
            .then(() => CustomerController.deleteOne(parseInt(req.params.customerId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//MATERIALS
mainRouter.route("/materials")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => {
                //Add userId to record the created user
                req.body.bindingObject.userId.value = req.session.userId;
                return MaterialController.createOne(req.body.bindingObject);
            }).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materials/:materialId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.getOne(parseInt(req.params.materialId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.deleteOne(parseInt(req.params.materialId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materials/:materialId/suppliers")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.getSuppliersByMaterial(parseInt(req.params.materialId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materials/@all/suppliers")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.setMaterialSupplierRelations(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.getMaterialSupplierRelations()).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//MATERIAL BATCHES
mainRouter.route("/materialBatches")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material batches", req.method)
            .then(() => MaterialBatchController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materialBatches/:materialBatchId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material batches", req.method)
            .then(() => MaterialBatchController.getOne(parseInt(req.params.materialBatchId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json(), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material batches", req.method)
            .then(() => MaterialBatchController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material batches", req.method)
            .then(() => MaterialBatchController.deleteOne(parseInt(req.params.materialBatchId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//MATERIAL IMPORT REQUESTS
mainRouter.route("/materialImportRequests")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import requests", req.method)
            .then(() => MaterialImportRequestController.createMany(req.body.bindingObject, req.body.additionalData.selectedSupplierIds)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import requests", req.method)
            .then(() => MaterialImportRequestController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materialImportRequests/:materialImportRequestId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import requests", req.method)
            .then(() => MaterialImportRequestController.getOne(parseInt(req.params.materialImportRequestId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import requests", req.method)
            .then(() => MaterialImportRequestController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import requests", req.method)
            .then(() => MaterialImportRequestController.deleteOne(parseInt(req.params.materialImportRequestId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//MATERIAL IMPORT QUOTATIONS
mainRouter.route("/materialImportQuotations")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import quotations", req.method)
            .then(() => MaterialImportQuotationController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import quotations", req.method)
            .then(() => MaterialImportQuotationController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materialImportQuotations/:materialImportQuotationId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import quotations", req.method)
            .then(() => MaterialImportQuotationController.getOne(parseInt(req.params.materialImportQuotationId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import quotations", req.method)
            .then(() => MaterialImportQuotationController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import quotations", req.method)
            .then(() => MaterialImportQuotationController.deleteOne(parseInt(req.params.materialImportQuotationId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//MATERIAL IMPORT ORDERS
mainRouter.route("/materialImportOrders")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import orders", req.method)
            .then(() => MaterialImportOrderController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import orders", req.method)
            .then(() => MaterialImportOrderController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materialImportOrders/:materialImportOrderId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import orders", req.method)
            .then(() => MaterialImportOrderController.getOne(parseInt(req.params.materialImportOrderId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import orders", req.method)
            .then(() => MaterialImportOrderController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import orders", req.method)
            .then(() => MaterialImportOrderController.deleteOne(parseInt(req.params.materialImportOrderId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materialImportOrders/:materialImportOrderCode/quotation")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import orders", req.method)
            .then(() => MaterialImportOrderController.getQuotation(req.params.materialImportOrderCode)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//MATERIAL IMPORT INVOICES
mainRouter.route("/materialImportInvoices")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import invoices", req.method)
            .then(() => MaterialImportInvoiceController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import invoices", req.method)
            .then(() => MaterialImportInvoiceController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/materialImportInvoices/:materialImportInvoiceId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import invoices", req.method)
            .then(() => MaterialImportInvoiceController.getOne(parseInt(req.params.materialImportInvoiceId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import invoices", req.method)
            .then(() => MaterialImportInvoiceController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import invoices", req.method)
            .then(() => MaterialImportInvoiceController.deleteOne(parseInt(req.params.materialImportInvoiceId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//MATERIAL IMPORTS
mainRouter.route("/materialImports/:numericCode")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material imports", req.method)
            .then(() => MaterialImportController.getSummary(req.params.numericCode)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//OUTBOUND PAYMENTS
mainRouter.route("/outboundPayments")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "outbound payments", req.method)
            .then(() => OutboundPaymentController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "outbound payments", req.method)
            .then(() => OutboundPaymentController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/outboundPayments/:outboundPaymentId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "outbound payments", req.method)
            .then(() => OutboundPaymentController.getOne(parseInt(req.params.outboundPaymentId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "outbound payments", req.method)
            .then(() => OutboundPaymentController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "outbound payments", req.method)
            .then(() => OutboundPaymentController.deleteOne(parseInt(req.params.outboundPaymentId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//PRODUCTS
mainRouter.route("/products")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => {
                //Add userId to record the created user
                req.body.bindingObject.userId.value = req.session.userId;
                return ProductController.createOne(req.body.bindingObject);
            }).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/products/:productId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.getOne(parseInt(req.params.productId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.deleteOne(parseInt(req.params.productId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/products/:productId/materials")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.getMaterialsByProduct(parseInt(req.params.productId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/products/@all/materials")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.setProductMaterialRelations(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.getProductMaterialRelations()).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//PRODUCT BATCHES
mainRouter.route("/productBatches")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product batches", req.method)
            .then(() => ProductBatchController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productBatches/:productBatchId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product batches", req.method)
            .then(() => ProductBatchController.getOne(parseInt(req.params.productBatchId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json(), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product batches", req.method)
            .then(() => ProductBatchController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product batches", req.method)
            .then(() => ProductBatchController.deleteOne(parseInt(req.params.productBatchId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//PRODUCT EXPORT REQUESTS
mainRouter.route("/productExportRequests")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export requests", req.method)
            .then(() => ProductExportRequestController.createMany(req.body.bindingObject, req.body.additionalData.selectedProductIds)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export requests", req.method)
            .then(() => ProductExportRequestController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productExportRequests/:productExportRequestId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export requests", req.method)
            .then(() => ProductExportRequestController.getOne(parseInt(req.params.productExportRequestId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export requests", req.method)
            .then(() => ProductExportRequestController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export requests", req.method)
            .then(() => ProductExportRequestController.deleteOne(parseInt(req.params.productExportRequestId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productExportRequests/:productExportRequestCode/product")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export requests", req.method)
            .then(() => ProductExportRequestController.getProduct(req.params.productExportRequestCode)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//PRODUCT EXPORT INVOICES
mainRouter.route("/productExportInvoices")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export invoices", req.method)
            .then(() => ProductExportInvoiceController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export invoices", req.method)
            .then(() => ProductExportInvoiceController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productExportInvoices/:productExportInvoiceId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export invoices", req.method)
            .then(() => ProductExportInvoiceController.getOne(parseInt(req.params.productExportInvoiceId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export invoices", req.method)
            .then(() => ProductExportInvoiceController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export invoices", req.method)
            .then(() => ProductExportInvoiceController.deleteOne(parseInt(req.params.productExportInvoiceId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//PRODUCT MANUFACTURING ORDERS
mainRouter.route("/productManufacturingOrders")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productManufacturingOrders/:productManufacturingOrderId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.getOne(parseInt(req.params.productManufacturingOrderId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.deleteOne(parseInt(req.params.productManufacturingOrderId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productManufacturingOrders/:productManufacturingOrderId/analysis")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.getMaterialAnalysis(parseInt(req.params.productManufacturingOrderId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productManufacturingOrders/:productManufacturingOrderCode/product")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.getProduct(req.params.productManufacturingOrderCode)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//PRODUCT MANUFACTURING INVOICES
mainRouter.route("/productManufacturingInvoices")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing invoices", req.method)
            .then(() => ProductManufacturingInvoiceController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing invoices", req.method)
            .then(() => ProductManufacturingInvoiceController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/productManufacturingInvoices/:productManufacturingInvoiceId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing invoices", req.method)
            .then(() => ProductManufacturingInvoiceController.getOne(parseInt(req.params.productManufacturingInvoiceId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing invoices", req.method)
            .then(() => ProductManufacturingInvoiceController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing invoices", req.method)
            .then(() => ProductManufacturingInvoiceController.deleteOne(parseInt(req.params.productManufacturingInvoiceId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//INBOUND PAYMENTS
mainRouter.route("/inboundPayments")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "inbound payments", req.method)
            .then(() => InboundPaymentController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "inbound payments", req.method)
            .then(() => InboundPaymentController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/inboundPayments/:inboundPaymentId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "inbound payments", req.method)
            .then(() => InboundPaymentController.getOne(parseInt(req.params.inboundPaymentId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "inbound payments", req.method)
            .then(() => InboundPaymentController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "inbound payments", req.method)
            .then(() => InboundPaymentController.deleteOne(parseInt(req.params.inboundPaymentId)))
            .then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//STATES
mainRouter.route("/states/:statusId/employees")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "employees", req.method)
            .then(() => EmployeeController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/suppliers")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "suppliers", req.method)
            .then(() => SupplierController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/customers")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "customers", req.method)
            .then(() => CustomerController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/materials")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "materials", req.method)
            .then(() => MaterialController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/materialBatches")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material batches", req.method)
            .then(() => MaterialBatchController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/materialImportRequests")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import requests", req.method)
            .then(() => MaterialImportRequestController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/materialImportQuotations")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import quotations", req.method)
            .then(() => MaterialImportQuotationController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/materialImportOrders")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import orders", req.method)
            .then(() => MaterialImportOrderController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/materialImportInvoices")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "material import invoices", req.method)
            .then(() => MaterialImportInvoiceController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/products")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "products", req.method)
            .then(() => ProductController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/productBatches")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product batches", req.method)
            .then(() => ProductBatchController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/productExportRequests")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export requests", req.method)
            .then(() => ProductExportRequestController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/productExportInvoices")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product export invoices", req.method)
            .then(() => ProductExportInvoiceController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/productManufacturingOrders")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing orders", req.method)
            .then(() => ProductManufacturingOrderController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/states/:statusId/productManufacturingInvoices")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "product manufacturing invoices", req.method)
            .then(() => ProductManufacturingInvoiceController.getManyByStatus(parseInt(req.params.statusId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//REPORTS
mainRouter.route("/reports/salesReport")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "sales reports", req.method)
            .then(() => ReportsController.getSalesReportBetween(req.query.startDate, req.query.endDate, req.query.groupBy)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/reports/revenueReport")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "revenue reports", req.method)
            .then(() => ReportsController.getRevenueReportBetween(req.query.startDate, req.query.endDate, req.query.groupBy)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

//USERS
mainRouter.route("/users")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
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
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
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
                return PermissionController.checkPermission(req.session.userId, "roles", req.method)
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
                return PermissionController.getOneByUser(req.session.userId, parseInt(req.params.moduleId));
            } else {
                return PermissionController.checkPermission(req.session.userId, "roles", req.method)
                    .then(() => PermissionController.getOneByUser(parseInt(req.params.userId), parseInt(req.params.moduleId)));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

mainRouter.route("/users/:userId/pattern")
    .get((req, res, next) => {
        (() => {
            if (req.params.userId === "@me") {
                return UserPreferenceController.checkPattern(req.session.userId, req.query.cellCombination);
            } else {
                return PermissionController.checkPermission(req.session.userId, "users", req.method)
                    .then(() => UserPreferenceController.checkPattern(parseInt(req.params.userId), req.query.cellCombination));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        (() => {
            if (req.params.userId === "@me") {
                return UserPreferenceController.updatePattern(req.session.userId, req.body.cellCombination);
            } else {
                return PermissionController.checkPermission(req.session.userId, "users", req.method)
                    .then(() => UserPreferenceController.updatePattern(parseInt(req.params.userId), req.body.cellCombination));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

mainRouter.route("/users/:userId/userPreferences")
    .get((req, res, next) => {
        (() => {
            if (req.params.userId === "@me") {
                return UserPreferenceController.getOne(req.session.userId);
            } else {
                return PermissionController.checkPermission(req.session.userId, "users", req.method)
                    .then(() => UserPreferenceController.getOne(parseInt(req.params.userId)));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    })
    .post(express.json({ limit: 1000000 }), (req, res, next) => {
        (() => {
            if (req.params.userId === "@me") {
                return UserPreferenceController.updateOne(req.body.bindingObject);
            } else {
                return PermissionController.checkPermission(req.session.userId, "users", req.method)
                    .then(() => UserPreferenceController.updateOne(req.body.bindingObject));
            }
        })().then(data => {
            res.locals.data = data; next();
        }).catch(error => {
            res.locals.error = error; next();
        });
    });

mainRouter.route("/roles")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => RoleController.createOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => RoleController.getMany(req.query.keyword)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/roles/:roleId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => RoleController.getOne(parseInt(req.params.roleId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => RoleController.updateOne(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .delete((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => RoleController.deleteOne(parseInt(req.params.roleId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/permissions")
    .put(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => PermissionController.cerateMany(req.body.bindingObject)).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    });

mainRouter.route("/permissions/:roleId")
    .get((req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
            .then(() => PermissionController.getManyByRole(parseInt(req.params.roleId))).then(data => {
                res.locals.data = data; next();
            }).catch(error => {
                res.locals.error = error; next();
            });
    })
    .post(express.json({ limit: "500kB" }), (req, res, next) => {
        PermissionController.checkPermission(req.session.userId, "roles", req.method)
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
        const resolvedPath = path.resolve(`${FileController.absolutePrivateDirectoryPath + req.session.userId}/${req.params.subDirectoryPath + req.params.fileName}`);

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
        //CASE: res.locales.data is present with data
        //Send data
        res.json({
            status: true,
            data: res.locals.data
        });
    } else {
        //CASE: res.locales.data is not present
        next();
    }
});

//Initiate handler for unsuccessful responses
mainRouter.use((req, res, next) => {
    //WARNING: This "else" is unnecessary as res.locales.error must be present by now
    if (res.locals.error) {
        //CASE: res.locales.error is present with data
        //Send data
        console.log("System error resolved:", res.locals.error);
        res.json({
            status: false,
            error: res.locals.error
        });
    }
})