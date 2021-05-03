import { getRepository } from "typeorm";

import { Product } from "../../entities/main/Product";

export class ProductRepository {
    static search(keyword) {
        return getRepository(Product)
            .createQueryBuilder("p")
            .leftJoinAndSelect("p.productStatus", "ps")
            .leftJoinAndSelect("p.unitType", "ut")
            .where("p.code LIKE :keyword", { keyword: `%${keyword}%` })
            .orWhere("p.name LIKE :keyword", { keyword: `%${keyword}%` })
            .orWhere("ps.name LIKE :keyword", { keyword: `%${keyword}%` })
            .orWhere("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
            .getMany();
    }

    static generateNextCode() {
        return getRepository(Product)
            .createQueryBuilder("p")
            .select("CONCAT('PRO', LPAD(SUBSTRING(MAX(p.code),4)+1, 7, '0'))", "value")
            .getRawOne();
    }

    static updateTable() {
        return Promise.all([
            getRepository(Product).query(`
                UPDATE product p, (SELECT pm.product_id, SUM(pm.material_amount * pm.unit_price_factor) unit_price FROM product_material pm GROUP BY pm.product_id) product_unit_price
                SET p.unit_price = product_unit_price.unit_price
                WHERE p.id = product_unit_price.product_id
            `),
            getRepository(Product).query(`
                UPDATE product p,
                (SELECT production_inventory.product_id, IFNULL(production_inventory.produced_amount,0) - IFNULL(product_usage.used_amount, 0) viable_amount FROM
                (SELECT pb.product_id, SUM(pb.produced_amount) produced_amount FROM product_batch pb GROUP BY pb.product_id) production_inventory LEFT JOIN 
                (SELECT per.product_id, SUM(per.requested_amount) used_amount FROM product_export_request per WHERE per.request_status_id = 2 GROUP BY per.product_id) product_usage
                ON product_usage.product_id = production_inventory.product_id) product_inventory
                SET
                p.viable_amount = product_inventory.viable_amount,
                p.product_status_id = CASE
                    WHEN p.reorder_amount < p.viable_amount THEN 2
                    ELSE 1
                END
                WHERE p.id = product_inventory.product_id
            `)
        ]);
    }
}