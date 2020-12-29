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
}