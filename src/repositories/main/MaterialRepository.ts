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

    static getDerivedOne(materialId: number) {
        return getRepository(Material).query(`
            SELECT  m.*, viable.viable_amount, expired.expired_amount
            FROM material m
            LEFT JOIN
                (SELECT mb.material_id, SUM(mb.amount) viable_amount
                FROM material_batch mb
                WHERE mb.batch_status_id = 1
                GROUP BY mb.material_id) viable
            ON m.id = viable.material_id
            LEFT JOIN
                (SELECT mb.material_id, SUM(mb.amount) expired_amount
                FROM material_batch mb
                WHERE mb.batch_status_id = 2
                GROUP BY mb.material_id) expired
            ON m.id = expired.material_id
            WHERE m.id = ${materialId};
        `,);
    }

    static generateNextCode() {
        return getRepository(Material)
            .createQueryBuilder("m")
            .select("CONCAT('MAT', SUBSTRING(MAX(m.code),4)+1)", "value")
            .getRawOne();
    }

    static updateTable() {
        return Promise.all(
            [getRepository(Material).query(`
                UPDATE material m
                LEFT JOIN
                    (SELECT mb.material_id, SUM(mb.amount) viable_amount
                    FROM material_batch mb
                    WHERE mb.batch_status_id = 1
                    GROUP BY mb.material_id) viable
                ON m.id = viable.material_id
                SET m.material_status_id = 1
                WHERE m.reorder_amount < viable.viable_amount
            `), getRepository(Material).query(`
                UPDATE material m
                LEFT JOIN
                    (SELECT mb.material_id, SUM(mb.amount) viable_amount
                    FROM material_batch mb
                    WHERE mb.batch_status_id = 1
                    GROUP BY mb.material_id) viable
                ON m.id = viable.material_id
                SET m.material_status_id = 2
                WHERE m.reorder_amount >= viable.viable_amount
        `)]
        );
    }
}