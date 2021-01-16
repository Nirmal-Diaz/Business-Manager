import { getRepository } from "typeorm";

import { OutboundPayment } from "../../entities/main/OutboundPayment";

export class OutboundPaymentRepository {
    static search(keyword) {
        return getRepository(OutboundPayment)
        .createQueryBuilder("op")
        .where("op.code LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(OutboundPayment)
        .createQueryBuilder("op")
        .select("CONCAT('OUP', SUBSTRING(MAX(op.code),4)+1)", "value")
        .getRawOne();
    }
}