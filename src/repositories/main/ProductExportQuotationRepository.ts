import { getRepository } from "typeorm";

import { ProductExportQuotation } from "../../entities/main/ProductExportQuotation";

export class ProductExportQuotationRepository {
    static search(keyword) {
        return getRepository(ProductExportQuotation)
        .createQueryBuilder("peq")
        .leftJoinAndSelect("peq.quotationStatus", "qs")
        .leftJoinAndSelect("peq.unitType", "ut")
        .where("peq.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static updateTable() {
        return getRepository(ProductExportQuotation)
        .query(`
            UPDATE product_export_quotation peq
            SET peq.quotation_status_id =
            CASE
                WHEN peq.quotation_status_id = 4 THEN 4
                WHEN DATEDIFF(peq.valid_from, NOW()) > 0 THEN 1
                WHEN DATEDIFF(peq.valid_till, NOW()) > 0 THEN 2
                ELSE 3
            END
        `);
    }
}