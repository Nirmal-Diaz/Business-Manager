import { ReportsRepository } from "../../repositories/main/ReportsRepository";

export class ReportsController {
    static async getSalesReportBetween(startDate: string, endDate: string) {
        return ReportsRepository.getSalesReport(startDate, endDate);
    }
}