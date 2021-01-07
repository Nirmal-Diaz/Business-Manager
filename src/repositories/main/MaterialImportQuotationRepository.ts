import { getRepository } from "typeorm";

import { MaterialImportQuotation } from "../../entities/main/MaterialImportQuotation";

export class MaterialImportQuotationRepository {
    static search(keyword) {
        return getRepository(MaterialImportQuotation)
        .createQueryBuilder("miq")
        .leftJoinAndSelect("miq.quotationStatus", "qs")
        .where("miq.code LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static updateTable() {
        return getRepository(MaterialImportQuotation)
        .query(`
            UPDATE material_import_quotation miq
            SET miq.quotation_status_id =
            CASE
                WHEN DATEDIFF(miq.valid_from, NOW()) > 0 THEN 1
                WHEN DATEDIFF(miq.valid_till, NOW()) > 0 THEN 2
                ELSE 3
            END
        `);
    }
}