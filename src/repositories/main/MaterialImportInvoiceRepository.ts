import { getRepository } from "typeorm";

import { MaterialImportInvoice } from "../../entities/main/MaterialImportInvoice";

export class MaterialImportInvoiceRepository {
    static search(keyword, offset) {
        return getRepository(MaterialImportInvoice)
        .createQueryBuilder("mii")
        .leftJoinAndSelect("mii.invoiceStatus", "is")
        .where("mii.code LIKE :keyword", { keyword: `%${keyword}%` })
        .limit(10)
        .offset(offset)
        .getMany();
    }

    static updateTable() {
        return getRepository(MaterialImportInvoice).query(`
            UPDATE material_import_invoice mii
            LEFT JOIN
                (SELECT op.invoice_code, SUM(op.price) payed_amount
                FROM outbound_payment op
                GROUP BY op.invoice_code) payed
            ON mii.code = payed.invoice_code
            SET mii.invoice_status_id =
            CASE
                WHEN mii.final_price > payed.payed_amount THEN 1
                ELSE 2
            END
        `);
    }
}