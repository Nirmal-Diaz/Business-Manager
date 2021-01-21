import { getRepository } from "typeorm"
import { ProductExportInvoice } from "../../entities/main/ProductExportInvoice"

export class ReportsRepository {
    static getSalesReport(startDate: string, endDate: string, groupBy: string) {
        //NOTE: startDate, endDate has the the syntax YYYY-MM-DD
        //NOTE: groupBy has the following values Year, Month, Week
        switch (groupBy) {
            case "Year": {
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

            case "Month": {
                return getRepository(ProductExportInvoice)
                    .query(`
                        SELECT Year(pei.added_date) year, MONTH(pei.added_date) group_number, COUNT(pei.id) sales_count, SUM(pei.final_price) expected_income, SUM(ip.price) actual_income, SUM(pei.final_price)-SUM(ip.price) debts
                        FROM product_export_invoice pei
                        LEFT JOIN inbound_payment ip
                        ON pei.code = ip.invoice_code
                        WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
                        GROUP BY Year(pei.added_date), MONTH(pei.added_date)
                    `);
            }

            case "Week": {
                return getRepository(ProductExportInvoice)
                    .query(`
                        SELECT Year(pei.added_date) year, WEEk(pei.added_date)+1 group_number, COUNT(pei.id) sales_count, SUM(pei.final_price) expected_income, SUM(ip.price) actual_income, SUM(pei.final_price)-SUM(ip.price) debts
                        FROM product_export_invoice pei
                        LEFT JOIN inbound_payment ip
                        ON pei.code = ip.invoice_code
                        WHERE pei.added_date BETWEEN "${startDate}" AND "${endDate}"
                        GROUP BY Year(pei.added_date), WEEK(pei.added_date)
                    `);
            }
        }
    }
}