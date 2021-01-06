import { getRepository } from "typeorm";

import { Material } from "../../entities/main/Material";
import { MaterialBatch } from "../../entities/main/MaterialBatch";

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
        .select("CONCAT('MAT', SUBSTRING(MAX(m.code),4)+1)", "value")
        .getRawOne();
    }

    static checkForLow(materialId: number) {
        return getRepository(Material)
        .createQueryBuilder("m")
        .select("IF(m.reorder_amount > SUM(mb.amount), 1, 0)", "value")
        .from(MaterialBatch, "mb")
        .where("mb.material_id = m.id")
        .andWhere("mb.material_id = :materialId", {materialId: materialId})
        .getRawOne();
    }

    //TODO: Implement updateTable() using SQL
    //WARNING: A temporary solution is implemented in the controller
    static updateMaterialStatus(materialId: number) {
        return MaterialRepository.checkForLow(materialId).then((lowStatus) => {
            if (lowStatus.value === "1") {
                return getRepository(Material)
                .createQueryBuilder()
                .update(Material)
                .set({materialStatusId: 2})
                .where("material.id = :materialId", {materialId: materialId})
                .execute()
            }
        }); 

    }
}