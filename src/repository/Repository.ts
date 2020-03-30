import { getRepository, createConnection } from "typeorm";
import { User } from "../entity/User";
import { Role } from "../entity/Role";

createConnection().then(() => {
    console.log("Connection status: Successful");
}).catch((error) => {
    console.error(error);
});

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

console.log("DAO status: Ready");