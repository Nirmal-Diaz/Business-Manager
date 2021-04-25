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
            .select("CONCAT('MAT', LPAD(SUBSTRING(MAX(m.code),4)+1, 7, '0'))", "value")
            .getRawOne();
    }

    static updateTable() {
        return getRepository(Material)
        .query(`
            UPDATE
            material m, material_batch mb, (SELECT mb.material_id, SUM(mb.imported_amount) viable_amount FROM material_batch mb WHERE mb.batch_status_id = 1 GROUP BY mb.material_id) viable_material
            SET m.viable_amount = viable_material.viable_amount
            WHERE m.id = viable_material.material_id;
        `);
    }
}