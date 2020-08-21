import { getRepository } from "typeorm";

import { Product } from "../../entities/main/Product";

export class ProductRepository {
    static search(keyword) {
        return getRepository(Product)
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.productStatus", "ps")
        .leftJoinAndSelect("p.unitType", "ut")
        .where("p.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ps.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}