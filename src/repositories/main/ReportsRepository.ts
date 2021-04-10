import { getRepository } from "typeorm"
import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice"

export class ReportsRepository {
    static getSalesReportByYear(startDate: string, endDate: string) {
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT *, expected_income-actual_income debts
            FROM
            (SELECT YEAR(pei.added_date) group_id, COUNT(pei.id) sales_count, IFNULL(SUM(pei.final_price),0) expected_income, IFNULL(SUM(ip.price),0) actual_income
            FROM product_export_invoice pei
            LEFT JOIN inbound_payment ip
            ON pei.code = ip.invoice_code
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) sales_table
        `);
    }

    static getSalesReportByMonthOrWeek(startDate: string, endDate: string, groupBy: string) {
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT *, expected_income-actual_income debts
            FROM
            (SELECT CONCAT(YEAR(pei.added_date), "-", ${groupBy}(pei.added_date)) group_id, COUNT(pei.id) sales_count, IFNULL(SUM(pei.final_price),0) expected_income, IFNULL(SUM(ip.price),0) actual_income
            FROM product_export_invoice pei
            LEFT JOIN inbound_payment ip
            ON pei.code = ip.invoice_code
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) sales_table
        `);
    }

    static getRevenueReportByYear(startDate: string, endDate: string) {
        //NOTE: Since MySQL doesn't have an explicit Full Outer Join we have to use union on the results of left join and the right join
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT *, income-expenditure revenue FROM

            (SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, IFNULL(expenditure,0) expenditure, IFNULL(income,0) income FROM
            (SELECT YEAR(pei.added_date) group_id, SUM(pei.price) income
            FROM product_export_invoice pei
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) income_table
            LEFT JOIN
            (SELECT YEAR(mii.added_date) group_id, SUM(mii.price) expenditure
            FROM material_import_invoice mii
            WHERE mii.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) expenditure_table
            ON income_table.group_id = expenditure_table.group_id
            
            UNION
            
            SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, IFNULL(expenditure,0) expenditure, IFNULL(income,0) income FROM
            (SELECT YEAR(pei.added_date) group_id, SUM(pei.price) income
            FROM product_export_invoice pei
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) income_table
            RIGHT JOIN
            (SELECT YEAR(mii.added_date) group_id, SUM(mii.price) expenditure
            FROM material_import_invoice mii
            WHERE mii.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) expenditure_table
            ON income_table.group_id = expenditure_table.group_id) income_expenditure_table
        `);
    }

    static getRevenueReportByMonthOrWeek(startDate: string, endDate: string, groupBy: string) {
        //NOTE: Since MySQL doesn't have an explicit Full Outer Join we have to use union on the results of left join and the right join
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT *, income-expenditure revenue FROM

            (SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, IFNULL(expenditure,0) expenditure, IFNULL(income,0) income FROM
            (SELECT CONCAT(YEAR(pei.added_date), "-", ${groupBy}(pei.added_date)) group_id, SUM(pei.price) income
            FROM product_export_invoice pei
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) income_table
            LEFT JOIN
            (SELECT CONCAT(YEAR(mii.added_date), "-", ${groupBy}(mii.added_date)) group_id, SUM(mii.price) expenditure
            FROM material_import_invoice mii
            WHERE mii.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) expenditure_table
            ON income_table.group_id = expenditure_table.group_id
            
            UNION
            
            SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, IFNULL(expenditure,0) expenditure, IFNULL(income,0) income FROM
            (SELECT CONCAT(YEAR(pei.added_date), "-", ${groupBy}(pei.added_date)) group_id, SUM(pei.price) income
            FROM product_export_invoice pei
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) income_table
            RIGHT JOIN
            (SELECT CONCAT(YEAR(mii.added_date), "-", ${groupBy}(mii.added_date)) group_id, SUM(mii.price) expenditure
            FROM material_import_invoice mii
            WHERE mii.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) expenditure_table
            ON income_table.group_id = expenditure_table.group_id) income_expenditure_table
        `);
    }

    static getProductDemandReportByYear(startDate: string, endDate: string) {
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT per.product_id, YEAR(pei.added_date) group_id, p.name product_name, p.code product_code, COUNT(pei.id) sales_count
            FROM product_export_invoice pei
            LEFT JOIN product_export_request per
            ON pei.request_code = per.code
            LEFT JOIN product p
            ON per.product_id = p.id
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY per.product_id, group_id
        `);
    }

    static getProductDemandReportByMonthOrWeek(startDate: string, endDate: string, groupBy: string) {
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT per.product_id, CONCAT(YEAR(pei.added_date), "-", ${groupBy}(pei.added_date)) group_id, p.name product_name, p.code product_code, COUNT(pei.id) sales_count
            FROM product_export_invoice pei
            LEFT JOIN product_export_request per
            ON pei.request_code = per.code
            LEFT JOIN product p
            ON per.product_id = p.id
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY per.product_id, group_id
        `);
    }
}