import { getRepository } from "typeorm";

import { MaterialBatch } from "../../entities/main/MaterialBatch";

export class MaterialBatchRepository {
    static search(keyword) {
        return getRepository(MaterialBatch)
        .createQueryBuilder("mb")
        .leftJoinAndSelect("mb.batchStatus", "bs")
        .leftJoinAndSelect("mb.unitType", "ut")
        .where("mb.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orderBy("mb.code", "DESC")
        .getMany();
    }

    static updateTable() {
        return getRepository(MaterialBatch)
        .query(`
            UPDATE material_batch mb
            SET mb.batch_status_id =
            CASE
                WHEN DATEDIFF(NOW(), mb.added_date) >= mb.viable_period THEN 2
                ELSE 1
            END
        `);
    }
}