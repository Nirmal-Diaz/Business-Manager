import { getRepository } from "typeorm";

import { ProductPackage } from "../../entities/main/ProductPackage";

export class ProductPackageRepository {
    static search(keyword) {
        return getRepository(ProductPackage)
        .createQueryBuilder("pp")
        .leftJoinAndSelect("pp.productPackageStatus", "pps")
        .leftJoinAndSelect("pp.product", "p")
        .leftJoinAndSelect("p.unitType", "ut")
        .where("pp.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("pp.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("pps.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(ProductPackage)
        .createQueryBuilder("pp")
        .select("CONCAT('PKG', SUBSTRING(MAX(pp.code),4)+1)", "value")
        .getRawOne();
    }
}