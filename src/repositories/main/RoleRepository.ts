import { getRepository } from "typeorm";

import { Role } from "../../entities/main/Role";

export class RoleRepository {
    static search(keyword) {
        return getRepository(Role)
        .createQueryBuilder("r")
        .leftJoinAndSelect("r.permissions", "p")
        .leftJoinAndSelect("p.module", "m")
        .where("r.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}