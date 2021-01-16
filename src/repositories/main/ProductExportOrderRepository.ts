import { getRepository } from "typeorm";

import { ProductExportOrder } from "../../entities/main/ProductExportOrder";

export class ProductExportOrderRepository {
    static search(keyword) {
        return getRepository(ProductExportOrder)
        .createQueryBuilder("peo")
        .leftJoinAndSelect("peo.orderStatus", "os")
        .leftJoinAndSelect("peo.unitType", "ut")
        .where("peo.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}