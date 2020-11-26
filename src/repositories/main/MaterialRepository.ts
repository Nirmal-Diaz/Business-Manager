import { getRepository } from "typeorm";

import { Material } from "../../entities/main/Material";

export class MaterialRepository {
    static search(keyword) {
        return getRepository(Material)
        .createQueryBuilder("m")
        .leftJoinAndSelect("m.materialStatus", "ms")
        .leftJoinAndSelect("m.unitType", "ut")
        .where("m.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("m.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ms.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(Material)
        .createQueryBuilder("m")
        .select("CONCAT('MAT', SUBSTRING(MAX(m.code),4)+1)", "value")
        .getRawOne();
    }
}