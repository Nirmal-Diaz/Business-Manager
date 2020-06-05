import { getRepository, createConnection } from "typeorm";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { Employee } from "../entities/Employee";

createConnection().then(() => {
    console.log("Connection status: Successful");
}).catch((error) => {
    console.error(error);
});

export class UserRepository {
    static search(keyword) {
        return getRepository(User)
        .createQueryBuilder("u")
        .leftJoinAndSelect("u.role", "r")
        .leftJoinAndSelect("u.userPreference", "up")
        .where("u.username LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("r.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}

export class RoleRepository {
    static search(keyword) {
        return getRepository(Role)
        .createQueryBuilder("r")
        .leftJoinAndSelect("r.permissions", "p")
        .leftJoinAndSelect("p.module", "m")
        .where("r.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}

export class EmployeeRepository {
    static search(keyword) {
        return getRepository(Employee)
        .createQueryBuilder("e")
        .leftJoinAndSelect("e.gender", "g")
        .leftJoinAndSelect("e.employeeStatus", "es")
        .leftJoinAndSelect("e.civilStatus", "cs")
        .leftJoinAndSelect("e.designation", "d")
        .where("e.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("e.fullName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("e.preferredName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("e.nicNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("e.address LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("e.land LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("e.mobile LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("g.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("es.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("cs.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("d.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}

console.log("DAO status: Ready");