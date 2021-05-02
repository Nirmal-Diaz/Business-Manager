import { getRepository } from "typeorm";

import { Supplier } from "../../entities/main/Supplier";

export class SupplierRepository {
    static search(keyword) {
        return getRepository(Supplier)
        .createQueryBuilder("s")
        .leftJoinAndSelect("s.supplierStatus", "ss")
        .where("s.code LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.personName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.personMobile LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.nicNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.address LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.businessName LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.regNumber LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("s.email LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("ss.name LIKE :keyword", { keyword: `%${keyword}%` })
        .getMany();
    }

    static generateNextCode() {
        return getRepository(Supplier)
        .createQueryBuilder("s")
        .select("CONCAT('SUP', LPAD(SUBSTRING(MAX(s.code),4)+1, 7, '0'))", "value")
        .getRawOne();
    }

    static updateTable() {
        return getRepository(Supplier)
        .query(`
            UPDATE supplier s, (SELECT mir.supplier_id, SUM(mii.final_price) - SUM(invoice_payment.payed_amount) arrears FROM material_import_request mir
            LEFT JOIN material_import_invoice mii ON mir.code = REPLACE(mii.code, "MII", "MIR")
            LEFT JOIN (SELECT op.invoice_code, SUM(op.price) payed_amount FROM outbound_payment op GROUP BY op.invoice_code) invoice_payment ON mii.code = invoice_payment.invoice_code
            GROUP BY mir.supplier_id) supplier_payment
            SET s.arrears = supplier_payment.arrears
            WHERE s.id = supplier_payment.supplier_id`
        )
    }
}