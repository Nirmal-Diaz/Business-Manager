import { ReportsRepository } from "../../repositories/main/ReportsRepository";

export class ReportsController {
    static async getSalesReportBetween(startDate: string, endDate: string, groupBy: string) {
        switch (groupBy) {
            case "Year": return ReportsRepository.getSalesReportByYear(startDate, endDate);
            case "Month": return ReportsRepository.getSalesReportByMonthOrWeek(startDate, endDate, "MONTH");
            case "Week": return ReportsRepository.getSalesReportByMonthOrWeek(startDate, endDate, "WEEK");
        }
    }

    static async getRevenueReportBetween(startDate: string, endDate: string, groupBy: string) {
        switch (groupBy) {
            case "Year": return ReportsRepository.getRevenueReportByYear(startDate, endDate);
            case "Month": return ReportsRepository.getRevenueReportByMonthOrWeek(startDate, endDate, "MONTH");
            case "Week": return ReportsRepository.getRevenueReportByMonthOrWeek(startDate, endDate, "WEEK");
        }
    }

    static async getProductDemandReportBetween(startDate: string, endDate: string, groupBy: string) {
        switch (groupBy) {
            case "Year": return ReportsRepository.getProductDemandReportByYear(startDate, endDate);
            case "Month": return ReportsRepository.getProductDemandReportByMonthOrWeek(startDate, endDate, "MONTH");
            case "Week": return ReportsRepository.getProductDemandReportByMonthOrWeek(startDate, endDate, "WEEK");
        }
    }
}