import { getRepository } from "typeorm";

import { MaterialBatch } from "../../entities/main/MaterialBatch";

export class MaterialBatchRepository {
    static search(keyword) {
        return getRepository(MaterialBatch)
        .createQueryBuilder("mb")
        .leftJoinAndSelect("mb.batchStatus", "bs")
        .where("mb.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("bs.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(MaterialBatch)
        .createQueryBuilder("mb")
        .select("CONCAT('MBT', SUBSTRING(MAX(mb.code),4)+1)", "value")
        .getRawOne();
    }

    static updateTable() {
        return getRepository(MaterialBatch)
        .createQueryBuilder()
        .update(MaterialBatch)
        .set({batchStatusId: 2})
        .where("DATEDIFF(NOW(), material_batch.added_date) >= material_batch.viable_period")
        .execute();
    }
}