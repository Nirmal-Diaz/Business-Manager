import { getRepository } from "typeorm"
import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice"

export class ReportsRepository {
    static getSalesReportByYear(startDate: string, endDate: string) {
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT Year(pei.added_date) group_id, COUNT(pei.id) sales_count, SUM(pei.final_price) expected_income, SUM(ip.price) actual_income, SUM(pei.final_price)-SUM(ip.price) debts
            FROM product_export_invoice pei
            LEFT JOIN inbound_payment ip
            ON pei.code = ip.invoice_code
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY Year(pei.added_date)
        `);
    }

    static getSalesReportByMonthOrWeek(startDate: string, endDate: string, groupBy: string) {
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT CONCAT(Year(pei.added_date), "-", ${groupBy}(pei.added_date)) group_id, COUNT(pei.id) sales_count, SUM(pei.final_price) expected_income, SUM(ip.price) actual_income, SUM(pei.final_price)-SUM(ip.price) debts
            FROM product_export_invoice pei
            LEFT JOIN inbound_payment ip
            ON pei.code = ip.invoice_code
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id
        `);
    }

    static getRevenueReportByYear(startDate: string, endDate: string) {
        //NOTE: Since MySQL doesn't have an explicit Full Outer Join we have to use union on the results of left join and the right join
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, expenditure_table.expenditure, income_table.income, IFNULL(income_table.income, 0) - IFNULL(expenditure_table.expenditure, 0) revenue FROM
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
            
            SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, expenditure_table.expenditure, income_table.income, IFNULL(income_table.income, 0) - IFNULL(expenditure_table.expenditure, 0) revenue FROM
            (SELECT YEAR(pei.added_date) group_id, SUM(pei.price) income
            FROM product_export_invoice pei
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) income_table
            RIGHT JOIN
            (SELECT YEAR(mii.added_date) group_id, SUM(mii.price) expenditure
            FROM material_import_invoice mii
            WHERE mii.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) expenditure_table
            ON income_table.group_id = expenditure_table.group_id
        `);
    }

    static getRevenueReportByMonthOrWeek(startDate: string, endDate: string, groupBy: string) {
        //NOTE: Since MySQL doesn't have an explicit Full Outer Join we have to use union on the results of left join and the right join
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, expenditure_table.expenditure, income_table.income, IFNULL(income_table.income, 0) - IFNULL(expenditure_table.expenditure, 0) revenue FROM
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
            
            SELECT IFNULL(income_table.group_id, expenditure_table.group_id) group_id, expenditure_table.expenditure, income_table.income, IFNULL(income_table.income, 0) - IFNULL(expenditure_table.expenditure, 0) revenue FROM
            (SELECT CONCAT(YEAR(pei.added_date), "-", ${groupBy}(pei.added_date)) group_id, SUM(pei.price) income
            FROM product_export_invoice pei
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) income_table
            RIGHT JOIN
            (SELECT CONCAT(YEAR(mii.added_date), "-", ${groupBy}(mii.added_date)) group_id, SUM(mii.price) expenditure
            FROM material_import_invoice mii
            WHERE mii.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY group_id) expenditure_table
            ON income_table.group_id = expenditure_table.group_id
        `);
    }
}