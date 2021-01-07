import { getRepository } from "typeorm";

import { MaterialImportRequest } from "../../entities/main/MaterialImportRequest";

export class MaterialImportRequestRepository {
    static search(keyword) {
        return getRepository(MaterialImportRequest)
        .createQueryBuilder("mir")
        .leftJoinAndSelect("mir.requestStatus", "rs")
        .leftJoinAndSelect("mir.supplier", "s")
        .leftJoinAndSelect("mir.material", "m")
        .where("mir.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("m.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(MaterialImportRequest)
        .createQueryBuilder("mir")
        .select("CONCAT('MIR', SUBSTRING(MAX(mir.code),4)+1)", "value")
        .getRawOne();
    }

    static updateTable() {
        return getRepository(MaterialImportRequest)
        .createQueryBuilder()
        .update(MaterialImportRequest)
        .set({requestStatusId: 3})
        .where("DATEDIFF(NOW(), material_import_request.added_date) >= material_import_request.valid_till")
        .execute();
    }
}