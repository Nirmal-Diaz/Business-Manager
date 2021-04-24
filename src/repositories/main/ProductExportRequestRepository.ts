import { getRepository } from "typeorm";

import { ProductExportRequest } from "../../entities/main/ProductExportRequest";

export class ProductExportRequestRepository {
    static search(keyword, offset) {
        return getRepository(ProductExportRequest)
        .createQueryBuilder("per")
        .leftJoinAndSelect("per.requestStatus", "rs")
        .leftJoinAndSelect("per.customer", "c")
        .leftJoinAndSelect("per.product", "p")
        .leftJoinAndSelect("per.unitType", "ut")
        .where("per.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("p.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        // .orderBy("per.code", "DESC")
        .limit(10)
        .offset(offset)
        .getMany();
    }

    static generateNextCode() {
        return getRepository(ProductExportRequest)
        .createQueryBuilder("per")
        .select("CONCAT('PER', LPAD(SUBSTRING(MAX(per.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}