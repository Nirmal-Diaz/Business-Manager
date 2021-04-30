import { getRepository } from "typeorm";

import { ProductBatch } from "../../entities/main/ProductBatch";

export class ProductBatchRepository {
    static search(keyword) {
        return getRepository(ProductBatch)
        .createQueryBuilder("pb")
        .leftJoinAndSelect("pb.product", "p")
        .leftJoinAndSelect("pb.batchStatus", "bs")
        .leftJoinAndSelect("pb.unitType", "ut")
        .where("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        .where("p.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("pb.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static updateTable() {
        return getRepository(ProductBatch)
        .query(`
            UPDATE product_batch pb
            SET pb.batch_status_id =
            CASE
                WHEN DATEDIFF(NOW(), pb.added_date) >= pb.viable_period THEN 2
                ELSE 1
            END
        `);
    }
}