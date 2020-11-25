import { getRepository } from "typeorm";

import { QuotationRequest } from "../../entities/main/QuotationRequest";

export class QuotationRequestRepository {
    static search(keyword) {
        return getRepository(QuotationRequest)
        .createQueryBuilder("qr")
        .leftJoinAndSelect("qr.quotationRequestStatus", "qrs")
        .leftJoinAndSelect("qr.supplier", "s")
        .leftJoinAndSelect("qr.material", "m")
        .where("qr.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("m.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}