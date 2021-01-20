import { getRepository } from "typeorm"
import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice"

export class ReportsRepository {
    static getSalesReport(startDate: string, endDate: string) {
        //NOTE: startDate, endDate has the the syntax YYYY-MM-DD
        return getRepository(ProductExportInvoice)
            .query(`
                SELECT YEAR(pei.added_date) year, MONTH(pei.added_date) month, COUNT(pei.id) sales_count, SUM(pei.final_price) expected_income, SUM(ip.price) actual_income, SUM(pei.final_price)-SUM(ip.price) debts
                FROM product_export_invoice pei
                LEFT JOIN inbound_payment ip
                ON pei.code = ip.invoice_code
                WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
                GROUP BY YEAR(pei.added_date), MONTH(pei.added_date)
            `);
    }
}