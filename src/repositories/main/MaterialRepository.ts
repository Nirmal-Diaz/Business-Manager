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
            UPDATE material m,
            (SELECT mb.material_id, SUM(mb.imported_amount) viable_amount FROM material_batch mb WHERE mb.batch_status_id = 1 GROUP BY mb.material_id) material_inventory
            SET
            m.viable_amount = material_inventory.viable_amount,
            m.material_status_id = CASE
                WHEN m.reorder_amount < material_inventory.viable_amount THEN 2
                ELSE 1
            END
            WHERE m.id = material_inventory.material_id
        `);
    }
}