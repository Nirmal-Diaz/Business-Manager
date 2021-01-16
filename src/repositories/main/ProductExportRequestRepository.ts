import { getRepository } from "typeorm";

import { ProductExportRequest } from "../../entities/main/ProductExportRequest";

export class ProductExportRequestRepository {
    static search(keyword) {
        return getRepository(ProductExportRequest)
        .createQueryBuilder("per")
        .leftJoinAndSelect("per.requestStatus", "rs")
        .leftJoinAndSelect("per.customer", "c")
        .leftJoinAndSelect("per.product", "p")
        .where("per.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(ProductExportRequest)
        .createQueryBuilder("per")
        .select("CONCAT('PER', SUBSTRING(MAX(per.code),4)+1)", "value")
        .getRawOne();
    }
}