import { getRepository } from "typeorm";

import { MaterialImportRequest } from "../../entities/main/MaterialImportRequest";

export class MaterialImportRequestRepository {
    static search(keyword, offset) {
        return getRepository(MaterialImportRequest)
        .createQueryBuilder("mir")
        .leftJoinAndSelect("mir.requestStatus", "rs")
        .leftJoinAndSelect("mir.supplier", "s")
        .leftJoinAndSelect("mir.material", "m")
        .where("mir.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("m.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orderBy("mir.code", "DESC")
        .limit(10)
        .offset(offset)
        .getMany();
    }

    static generateNextCode() {
        return getRepository(MaterialImportRequest)
        .createQueryBuilder("mir")
        .select("CONCAT('MIR', LPAD(SUBSTRING(MAX(mir.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }
}