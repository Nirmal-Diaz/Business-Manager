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

    //WARNING: Following query doesn't care about expired batches
    static updateTable() {
        return getRepository(Material)
        .query(`
            UPDATE material m,
            (SELECT mb.material_id, SUM(mb.imported_amount) imported_amount FROM material_batch mb GROUP BY mb.material_id) material_import_inventory,
            (SELECT pm.material_id, SUM(pmo.requested_amount*pm.material_amount) used_amount FROM product_manufacturing_order pmo LEFT JOIN product_material pm ON pmo.product_id=pm.product_id WHERE pmo.order_status_id = 2 GROUP BY pm.material_id) material_usage
            SET
            m.viable_amount = material_import_inventory.imported_amount - material_usage.used_amount,
            m.material_status_id = CASE
                WHEN m.reorder_amount < m.viable_amount THEN 2
                ELSE 1
            END
            WHERE m.id = material_import_inventory.material_id
        `);
    }
}