import { getRepository } from "typeorm";

import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice";

export class ProductExportInvoiceRepository {
    static search(keyword) {
        return getRepository(ProductExportInvoice)
        .createQueryBuilder("pei")
        .leftJoinAndSelect("pei.invoiceStatus", "is")
        .where("pei.code LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static updateTable() {
        return getRepository(ProductExportInvoice).query(`
            UPDATE product_export_invoice pei
            LEFT JOIN
                (SELECT op.invoice_code, SUM(op.price) payed_amount
                FROM outbound_payment op
                GROUP BY op.invoice_code) payed
            ON pei.code = payed.invoice_code
            SET pei.invoice_status_id =
            CASE
                WHEN pei.final_price > payed.payed_amount THEN 1
                ELSE 2
            END
        `);
    }
}