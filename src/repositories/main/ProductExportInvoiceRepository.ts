import { getRepository } from "typeorm";

import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice";

export class ProductExportInvoiceRepository {
    static search(keyword) {
        return getRepository(ProductExportInvoice)
        .createQueryBuilder("pei")
        .leftJoinAndSelect("pei.invoiceStatus", "is")
        .where("pei.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orderBy("pei.code", "DESC")
        .getMany();
    }

    static updateTable() {
        return getRepository(ProductExportInvoice).query(`
            UPDATE material_import_invoice pei
            LEFT JOIN
                (SELECT ip.invoice_code, SUM(ip.price) payed_amount
                FROM inbound_payment ip
                GROUP BY ip.invoice_code) payed
            ON pei.code = payed.invoice_code
            SET pei.invoice_status_id =
            CASE
                WHEN pei.final_price > payed.payed_amount THEN 1
                ELSE 2
            END
        `);
    }
}