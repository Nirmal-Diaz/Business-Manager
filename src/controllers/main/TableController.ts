import { getRepository } from "typeorm";

import { Theme } from "../../entities/main/Theme";
import { Gender } from "../../entities/main/Gender";
import { CivilStatus } from "../../entities/main/CivilStatus";
import { EmployeeStatus } from "../../entities/main/EmployeeStatus";
import { Designation } from "../../entities/main/Designation";
import { Module } from "../../entities/main/Module";
import { CustomerStatus } from "../../entities/main/CustomerStatus";
import { SupplierStatus } from "../../entities/main/SupplierStatus";
import { MaterialStatus } from "../../entities/main/MaterialStatus";
import { UnitType } from "../../entities/main/UnitType";
import { ProductStatus } from "../../entities/main/ProductStatus";

export class TableController {
    static async getMany(tableName: string) {
        const generalEntities = {
            module: Module,
            theme: Theme,
            gender: Gender,
            civilStatus: CivilStatus,
            employeeStatus: EmployeeStatus,
            designation: Designation,
            customerStatus: CustomerStatus,
            supplierStatus: SupplierStatus,
            materialStatus: MaterialStatus,
            productStatus: ProductStatus,
            unitType: UnitType
        };

        if (generalEntities.hasOwnProperty(tableName)) {
            const items = await getRepository(generalEntities[tableName]).find();
            if (items.length > 0) {
                return items;
            } else {
                throw { title: "Isn't it empty", titleDescription: "Add some items first", message: "Looks like the table you are requesting doesn't have any items in it", technicalMessage: "Requested an empty table" };
            }
        } else {
            throw { title: "Whoa! Stop right there", titleDescription: "Try logging in as a privileged role first", message: "Looks like your role don't have access to the requested data. Only general data is available for anyone that's logged in", technicalMessage: "Requested access to a non-general entity" };
        }
    }
}