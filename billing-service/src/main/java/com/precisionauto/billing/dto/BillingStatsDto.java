package com.precisionauto.billing.dto;

public class BillingStatsDto {
    private Double totalRevenue;
    private Double pendingRevenue;
    private Long totalInvoices;
    private Long paidInvoices;
    private Long pendingInvoices;
    private Double averageInvoiceValue;

    public BillingStatsDto() {}

    public BillingStatsDto(Double totalRevenue, Double pendingRevenue, Long totalInvoices, Long paidInvoices, Long pendingInvoices, Double averageInvoiceValue) {
        this.totalRevenue = totalRevenue;
        this.pendingRevenue = pendingRevenue;
        this.totalInvoices = totalInvoices;
        this.paidInvoices = paidInvoices;
        this.pendingInvoices = pendingInvoices;
        this.averageInvoiceValue = averageInvoiceValue;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Double getPendingRevenue() {
        return pendingRevenue;
    }

    public void setPendingRevenue(Double pendingRevenue) {
        this.pendingRevenue = pendingRevenue;
    }

    public Long getTotalInvoices() {
        return totalInvoices;
    }

    public void setTotalInvoices(Long totalInvoices) {
        this.totalInvoices = totalInvoices;
    }

    public Long getPaidInvoices() {
        return paidInvoices;
    }

    public void setPaidInvoices(Long paidInvoices) {
        this.paidInvoices = paidInvoices;
    }

    public Long getPendingInvoices() {
        return pendingInvoices;
    }

    public void setPendingInvoices(Long pendingInvoices) {
        this.pendingInvoices = pendingInvoices;
    }

    public Double getAverageInvoiceValue() {
        return averageInvoiceValue;
    }

    public void setAverageInvoiceValue(Double averageInvoiceValue) {
        this.averageInvoiceValue = averageInvoiceValue;
    }
}
