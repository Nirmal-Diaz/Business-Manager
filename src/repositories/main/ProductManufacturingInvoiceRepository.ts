import { getRepository } from "typeorm";

import { ProductManufacturingInvoice } from "../../entities/main/ProductManufacturingInvoice";

export class ProductManufacturingInvoiceRepository {
    static search(keyword, offset) {
        return getRepository(ProductManufacturingInvoice)
        .createQueryBuilder("pmi")
        .leftJoinAndSelect("pmi.invoiceStatus", "is")
        .where("pmi.code LIKE :keyword", { keyword: `%${keyword}%` })
        .limit(10)
        .offset(offset)
        .getMany();
    }

    static updateTable() {
        return getRepository(ProductManufacturingInvoice).query(`
            UPDATE product_manufacturing_invoice pmi
            LEFT JOIN
                (SELECT op.invoice_code, SUM(op.price) payed_amount
                FROM outbound_payment op
                GROUP BY op.invoice_code) payed
            ON pmi.code = payed.invoice_code
            SET pmi.invoice_status_id =
            CASE
                WHEN pmi.final_price > payed.payed_amount THEN 1
                ELSE 2
            END
        `);
    }
}