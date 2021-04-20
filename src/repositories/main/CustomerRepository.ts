import { getRepository } from "typeorm";

import { Customer } from "../../entities/main/Customer";

export class CustomerRepository {
    static search(keyword) {
        return getRepository(Customer)
        .createQueryBuilder("c")
        .leftJoinAndSelect("c.customerStatus", "cs")
        .where("c.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.personMobile LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.nicNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.address LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.regNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.email LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("cs.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orderBy("c.code", "DESC")
        .getMany();
    }

    static generateNextCode() {
        return getRepository(Customer)
        .createQueryBuilder("c")
        .select("CONCAT('CUS', LPAD(SUBSTRING(MAX(c.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}