import { getRepository } from "typeorm";

import { Quotation } from "../../entities/main/Quotation";

export class QuotationRepository {
    static search(keyword) {
        return getRepository(Quotation)
        .createQueryBuilder("q")
        .leftJoinAndSelect("q.quotationStatus", "qs")
        .where("q.code LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}