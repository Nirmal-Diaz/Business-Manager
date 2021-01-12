import { getRepository } from "typeorm";

import { MaterialImportInvoice } from "../../entities/main/MaterialImportInvoice";

export class MaterialImportInvoiceRepository {
    static search(keyword) {
        return getRepository(MaterialImportInvoice)
        .createQueryBuilder("mii")
        .leftJoinAndSelect("mii.invoiceStatus", "is")
        .where("mii.code LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }
}