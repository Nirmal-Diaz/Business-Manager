import { getRepository } from "typeorm";

import { InboundPayment } from "../../entities/main/InboundPayment";

export class InboundPaymentRepository {
    static search(keyword) {
        return getRepository(InboundPayment)
        .createQueryBuilder("ip")
        .where("ip.code LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(InboundPayment)
        .createQueryBuilder("ip")
        .select("CONCAT('INP', LPAD(SUBSTRING(MAX(ip.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}