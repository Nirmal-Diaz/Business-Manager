import { getRepository } from "typeorm";

import { OutboundPayment } from "../../entities/main/OutboundPayment";

export class OutboundPaymentRepository {
    static search(keyword) {
        return getRepository(OutboundPayment)
        .createQueryBuilder("op")
        .where("op.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("op.invoiceCode LIKE :keyword", { keyword: `%${keyword}%` })
        .orderBy("op.code", "DESC")
        .getMany();
    }

    static generateNextCode() {
        return getRepository(OutboundPayment)
        .createQueryBuilder("op")
        .select("CONCAT('OUP', LPAD(SUBSTRING(MAX(op.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}