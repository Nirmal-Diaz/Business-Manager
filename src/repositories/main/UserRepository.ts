import { getRepository } from "typeorm";

import { User } from "../../entities/main/User";

export class UserRepository {
    static search(keyword) {
        return getRepository(User)
        .createQueryBuilder("u")
        .leftJoinAndSelect("u.role", "r")
        .leftJoinAndSelect("u.userPreference", "up")
        .where("u.username LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("r.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}