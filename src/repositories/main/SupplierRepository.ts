import { getRepository } from "typeorm";

import { Supplier } from "../../entities/main/Supplier";

export class SupplierRepository {
    static search(keyword) {
        return getRepository(Supplier)
        .createQueryBuilder("s")
        .leftJoinAndSelect("s.supplierStatus", "ss")
        .where("s.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.personMobile LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.nicNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.address LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.regNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.email LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ss.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(Supplier)
        .createQueryBuilder("s")
        .select("CONCAT('SUP', SUBSTRING(MAX(s.code),4)+1)", "value")
        .getRawOne();
    }
}