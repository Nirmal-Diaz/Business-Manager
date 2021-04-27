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

    static getProductAnalysis(id: number) {
        return getRepository(ProductExportRequest).query(`
            SELECT p.code, p.name, p.viable_amount, per.requested_amount needed_amount, p.viable_amount - per.requested_amount missing_amount, ut.name unit_name FROM product p
            LEFT JOIN product_export_request per
            ON per.product_id = p.id
            LEFT JOIN unit_type ut
            ON p.unit_type_id = ut.id
            WHERE per.id = ${id}
        `);
    }
}