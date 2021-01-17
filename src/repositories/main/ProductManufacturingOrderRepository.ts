import { getRepository } from "typeorm";

import { ProductManufacturingOrder } from "../../entities/main/ProductManufacturingOrder";

export class ProductManufacturingOrderRepository {
    static search(keyword) {
        return getRepository(ProductManufacturingOrder)
        .createQueryBuilder("pmo")
        .leftJoinAndSelect("pmo.orderStatus", "os")
        .leftJoinAndSelect("pmo.product", "p")
        .leftJoinAndSelect("pmo.unitType", "ut")
        .where("pmo.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        .where("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(ProductManufacturingOrder)
        .createQueryBuilder("pmo")
        .select("CONCAT('PMO', LPAD(SUBSTRING(MAX(pmo.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}