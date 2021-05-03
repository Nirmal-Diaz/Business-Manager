import { getRepository } from "typeorm";

import { MaterialImportQuotation } from "../../entities/main/MaterialImportQuotation";

export class MaterialImportQuotationRepository {
    static search(keyword, offset) {
        return getRepository(MaterialImportQuotation)
        .createQueryBuilder("miq")
        .leftJoinAndSelect("miq.quotationStatus", "qs")
        .leftJoinAndSelect("miq.unitType", "ut")
        .where("miq.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .limit(30)
        .offset(offset)
        .getMany();
    }

    static updateTable() {
        return getRepository(MaterialImportQuotation)
        .query(`
            UPDATE material_import_quotation miq
            SET miq.quotation_status_id =
            CASE
                WHEN miq.quotation_status_id = 4 THEN 4
                WHEN DATEDIFF(miq.valid_from, NOW()) > 0 THEN 1
                WHEN DATEDIFF(NOW(), miq.valid_from) > 0 AND DATEDIFF(miq.valid_till, NOW()) > 0 THEN 2
                ELSE 3
            END
        `);
    }
}