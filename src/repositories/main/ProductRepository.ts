import { getRepository } from "typeorm";

import { Product } from "../../entities/main/Product";

export class ProductRepository {
    static search(keyword) {
        return getRepository(Product)
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.productStatus", "ps")
        .leftJoinAndSelect("p.unitType", "ut")
        .where("p.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ps.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(Product)
        .createQueryBuilder("p")
        .select("CONCAT('PRO', LPAD(SUBSTRING(MAX(p.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}