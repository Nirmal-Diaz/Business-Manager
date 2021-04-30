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
                UPDATE product p
                LEFT JOIN
                    (SELECT pm.product_id, SUM(pm.material_amount * pm.unit_price_factor) unit_price
                    FROM business_manager.product_material pm
                    GROUP BY pm.product_id) product_unit_price
                ON p.id = product_unit_price.product_id
                SET p.unit_price = product_unit_price.unit_price
                WHERE p.id = product_unit_price.product_id
            `),
            getRepository(Product).query(`
                UPDATE 
                product p, product_batch pb, (SELECT pb.product_id, SUM(pb.produced_amount) viable_amount FROM product_batch pb WHERE pb.batch_status_id = 1 GROUP BY pb.product_id) viable_product
                SET p.viable_amount = viable_product.viable_amount
                WHERE p.id = viable_product.product_id;
            `)
        ]);
    }
}