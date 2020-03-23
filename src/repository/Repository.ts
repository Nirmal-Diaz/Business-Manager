import { getRepository, createConnection, Connection, getConnection } from "typeorm";
import { Permission } from "../entity/Permission";
import { User } from "../entity/User";

//TYPE ORM
createConnection().then(() => {
    console.log("Connection status: Successful");
}).catch((error) => {
    console.error(error);
});

export class GeneralRepository {
    static createRow(insertInto, columnNames, columnValues) {
        // return new Promise((resolve, reject) => {
        //     //Create questionMarksString
        //     const questionMarksString = "?,".repeat(columnValues.length).slice(0, -1);
        //     connection.query(`INSERT INTO d.${insertInto} (${columnNames.join(",")}) VALUES (${questionMarksString})`, columnValues, (error, result) => {
        //         if (error) {
        //             reject({ title: "Well, that's unexpected", titleDescription: "Contact your system administrator", message: "Looks like there's an error in the database related parts of the system. These kind of errors are considered critical. Contact your system administrator immediately", technicalMessage: error.message + "\n\n" + error.sql });
        //         } else {
        //             resolve(result);
        //         }
        //     });
        // });
    }
    
    static getJoinedRows(from, innerJoin, where, whereLogic) {
        // return new Promise((resolve, reject) => {
        //     let query = `
        //         SELECT * FROM d.${from} `;
        //     for (let i = 0; i < innerJoin.length; i++) {
        //         query += `INNER JOIN d.${innerJoin[i][0]} ON d.${from}.${innerJoin[i][1]} = d.${innerJoin[i][0]}.${innerJoin[i][1]} `;
        //     }
        //     if (where !== null) {
        //         //Case: Filtered rows are requested
        //         query += "WHERE ";
        //         const whereClauses = [];
        //         for (let i = 0; i < where.length; i++) {
        //             if (where[i][2] === "true") {
        //                 //Case: Exact match is required
        //                 whereClauses.push(`d.${where[i][0]}.${where[i][1]} = "${where[i][3]}"`);
        //             } else {
        //                 whereClauses.push(`d.${where[i][0]}.${where[i][1]} LIKE "%${where[i][3]}%"`);
        //             }
        //         }
        //         //NOTE: if where.length === 0, override where logic
        //         //NOTE: if where.length > 1, whereLogic must not be null
        //         if (where.length === 0) {
        //             whereLogic = "";
        //         }
        //         query += whereClauses.join(` ${whereLogic} `);
        //     }

        //     connection.query(query, (error, result) => {
        //         if (error) {
        //             reject({ title: "Well, that's unexpected", titleDescription: "Contact your system administrator", message: "Looks like there's an error in the database related parts of the system. These kind of errors are considered critical. Contact your system administrator immediately", technicalMessage: error.message + "\n\n" + error.sql });
        //         } else {
        //             resolve(result);
        //         }
        //     });
        // });
    }
    
    static deleteRowsByExactMatch(tableName, columnName, columnDatum) {
        // return new Promise((resolve, reject) => {
        //     connection.query(`
        //         DELETE FROM d.${tableName}
        //         WHERE ${columnName} = ${columnDatum}
        //     `, (error, result) => {
        //         if (error) {
        //             reject({ title: "Well, that's unexpected", titleDescription: "Contact your system administrator", message: "Looks like there's an error in the database related parts of the system. These kind of errors are considered critical. Contact your system administrator immediately", technicalMessage: error.message + "\n\n" + error.sql });
        //         } else {
        //             resolve(result);
        //         }
        //     });
        // });
    }
}

export class PermissionRepository {
    static getPermissionsForModule(userId, moduleName) {
        return getRepository(Permission)
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.module", "m")
        .where("p.userId = :userId", { userId: userId })
        .andWhere("m.name = :moduleName", { moduleName: moduleName })
        .getOne();
    }
    
    static getAllPermissions(username) {
        // return getRepository(UserModulePermission).find({where : {username: username}});
    }
}

export class UserRepository {
    static searchUsers(keyword) {
        return getRepository(User)
        .createQueryBuilder("u")
        .leftJoinAndSelect("u.role", "r")
        .where("u.username LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("r.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}

console.log("DAO status: Ready");