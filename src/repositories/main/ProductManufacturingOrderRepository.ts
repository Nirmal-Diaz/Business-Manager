import { getRepository } from "typeorm";

import { ProductManufacturingOrder } from "../../entities/main/ProductManufacturingOrder";

export class ProductManufacturingOrderRepository {
    static search(keyword, offset) {
        return getRepository(ProductManufacturingOrder)
        .createQueryBuilder("pmo")
        .leftJoinAndSelect("pmo.orderStatus", "os")
        .leftJoinAndSelect("pmo.product", "p")
        .leftJoinAndSelect("pmo.unitType", "ut")
        .where("pmo.code LIKE :keyword", { keyword: `%${keyword}%` })
        .where("p.name LIKE :keyword", { keyword: `%${keyword}%` })
        .where("ut.name LIKE :keyword", { keyword: `%${keyword}%` })
        .limit(30)
        .offset(offset)
        .getMany();
    }

    static generateNextCode() {
        return getRepository(ProductManufacturingOrder)
        .createQueryBuilder("pmo")
        .select("CONCAT('PMO', LPAD(SUBSTRING(MAX(pmo.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }

    static getMaterialAnalysis(code: string) {
        return getRepository(ProductManufacturingOrder).query(`
            SELECT m.code, m.name, m.viable_amount, pm.material_amount * pmo.requested_amount needed_amount, pm.material_amount * pmo.requested_amount - m.viable_amount missing_amount, ut.name unit_name FROM product_material pm
            LEFT JOIN product_manufacturing_order pmo
            ON pmo.product_id = pm.product_id
            LEFT JOIN material m
            ON pm.material_id = m.id
            LEFT JOIN unit_type ut
            ON m.unit_type_id = ut.id
            WHERE pmo.code = "${code}"
        `);
    }
}