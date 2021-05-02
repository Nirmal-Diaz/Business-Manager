import { getRepository } from "typeorm";

import { Customer } from "../../entities/main/Customer";

export class CustomerRepository {
    static search(keyword) {
        return getRepository(Customer)
        .createQueryBuilder("c")
        .leftJoinAndSelect("c.customerStatus", "cs")
        .where("c.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.personMobile LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.nicNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.address LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.regNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("c.email LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("cs.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(Customer)
        .createQueryBuilder("c")
        .select("CONCAT('CUS', LPAD(SUBSTRING(MAX(c.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }

    static updateTable() {
        return getRepository(Customer)
        .query(`
            UPDATE customer c, (SELECT per.customer_id, SUM(pei.final_price) - SUM(invoice_payment.payed_amount) arrears FROM product_export_request per
            LEFT JOIN product_export_invoice pei ON per.code = REPLACE(pei.code, "PEI", "PER")
            LEFT JOIN (SELECT ip.invoice_code, SUM(ip.price) payed_amount FROM inbound_payment ip GROUP BY ip.invoice_code) invoice_payment ON pei.code = invoice_payment.invoice_code
            GROUP BY per.customer_id) customer_payment
            SET c.arrears = customer_payment.arrears
            WHERE c.id = customer_payment.customer_id`
        )
    }
}