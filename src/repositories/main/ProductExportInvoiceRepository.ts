import { getRepository } from "typeorm";

import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice";

export class ProductExportInvoiceRepository {
    static search(keyword, offset) {
        return getRepository(ProductExportInvoice)
        .createQueryBuilder("pei")
        .leftJoinAndSelect("pei.invoiceStatus", "is")
        .where("pei.code LIKE :keyword", { keyword: `%${keyword}%` })
        .limit(30)
        .offset(offset)
        .getMany();
    }

    static updateTable() {
        return getRepository(ProductExportInvoice).query(`
            UPDATE material_import_invoice pei, (SELECT ip.invoice_code, SUM(ip.price) payed_amount FROM inbound_payment ip GROUP BY ip.invoice_code) invoice_payment
            SET pei.invoice_status_id =
            CASE
                WHEN pei.final_price > invoice_payment.payed_amount THEN 1
                ELSE 2
            END
        `);
    }
}