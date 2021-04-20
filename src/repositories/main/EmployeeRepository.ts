import { getRepository } from "typeorm";

import { Employee } from "../../entities/main/Employee";

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
        .orderBy("e.code", "DESC")
        .getMany();
    }

    static generateNextCode() {
        return getRepository(Employee)
        .createQueryBuilder("e")
        .select("CONCAT('EMP', LPAD(SUBSTRING(MAX(e.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}