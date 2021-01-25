import { getRepository } from "typeorm"
import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice"

export class ReportsRepository {
    static getSalesReportByYear(startDate: string, endDate: string) {
        return getRepository(ProductExportInvoice)
        .query(`
            SELECT Year(pei.added_date) year, COUNT(pei.id) sales_count, SUM(pei.final_price) expected_income, SUM(ip.price) actual_income, SUM(pei.final_price)-SUM(ip.price) debts
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
            SELECT Year(pei.added_date) year, ${groupBy}(pei.added_date) group_number, COUNT(pei.id) sales_count, SUM(pei.final_price) expected_income, SUM(ip.price) actual_income, SUM(pei.final_price)-SUM(ip.price) debts
            FROM product_export_invoice pei
            LEFT JOIN inbound_payment ip
            ON pei.code = ip.invoice_code
            WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
            GROUP BY Year(pei.added_date), ${groupBy}(pei.added_date)
        `);
    }
}