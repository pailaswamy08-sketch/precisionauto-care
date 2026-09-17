package com.precisionauto.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    private Long serviceRecordId;

    private String bookingReference;

    @Column(nullable = false)
    private String vehicleVin;

    @Column(nullable = false)
    private String vehiclePlate;

    private String vehicleModel;

    @Column(nullable = false)
    private String customerName;

    private String customerEmail;
    private String customerPhone;

    @Column(length = 1000)
    private String serviceDescription;

    private Double laborHours = 0.0;
    private Double laborRatePerHour = 95.0;
    private Double laborTotal = 0.0;
    private Double partsTotal = 0.0;
    private Double shopSuppliesFee = 18.50; // Standard environmental & waste disposal fee

    private Double subtotal = 0.0;
    private Double discountPercentage = 0.0;
    private Double discountAmount = 0.0;
    private Double taxPercentage = 18.0; // GST / VAT standard rate
    private Double taxAmount = 0.0;
    private Double totalAmount = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String paymentMethod; // "FLEET_CREDIT", "CORPORATE_CARD", "ACH_TRANSFER"

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    public Invoice() {
        this.createdAt = LocalDateTime.now();
    }

    public void addLineItem(InvoiceLineItem item) {
        lineItems.add(item);
        item.setInvoice(this);
    }

    public void calculateDynamicTotals() {
        this.laborTotal = (this.laborHours != null && this.laborRatePerHour != null)
                ? Math.round(this.laborHours * this.laborRatePerHour * 100.0) / 100.0
                : 0.0;

        this.partsTotal = lineItems.stream()
                .filter(i -> "PART".equalsIgnoreCase(i.getItemType()))
                .mapToDouble(i -> i.getTotalPrice() != null ? i.getTotalPrice() : 0.0)
                .sum();
        this.partsTotal = Math.round(this.partsTotal * 100.0) / 100.0;

        if (this.shopSuppliesFee == null) {
            this.shopSuppliesFee = 18.50;
        }

        this.subtotal = Math.round((this.laborTotal + this.partsTotal + this.shopSuppliesFee) * 100.0) / 100.0;

        if (this.discountPercentage != null && this.discountPercentage > 0) {
            this.discountAmount = Math.round((this.subtotal * (this.discountPercentage / 100.0)) * 100.0) / 100.0;
        } else {
            this.discountAmount = 0.0;
        }

        double taxableAmount = Math.max(0.0, this.subtotal - this.discountAmount);

        if (this.taxPercentage != null && this.taxPercentage > 0) {
            this.taxAmount = Math.round((taxableAmount * (this.taxPercentage / 100.0)) * 100.0) / 100.0;
        } else {
            this.taxAmount = 0.0;
        }

        this.totalAmount = Math.round((taxableAmount + this.taxAmount) * 100.0) / 100.0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Long getServiceRecordId() {
        return serviceRecordId;
    }

    public void setServiceRecordId(Long serviceRecordId) {
        this.serviceRecordId = serviceRecordId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public String getVehicleVin() {
        return vehicleVin;
    }

    public void setVehicleVin(String vehicleVin) {
        this.vehicleVin = vehicleVin;
    }

    public String getVehiclePlate() {
        return vehiclePlate;
    }

    public void setVehiclePlate(String vehiclePlate) {
        this.vehiclePlate = vehiclePlate;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getServiceDescription() {
        return serviceDescription;
    }

    public void setServiceDescription(String serviceDescription) {
        this.serviceDescription = serviceDescription;
    }

    public Double getLaborHours() {
        return laborHours;
    }

    public void setLaborHours(Double laborHours) {
        this.laborHours = laborHours;
    }

    public Double getLaborRatePerHour() {
        return laborRatePerHour;
    }

    public void setLaborRatePerHour(Double laborRatePerHour) {
        this.laborRatePerHour = laborRatePerHour;
    }

    public Double getLaborTotal() {
        return laborTotal;
    }

    public void setLaborTotal(Double laborTotal) {
        this.laborTotal = laborTotal;
    }

    public Double getPartsTotal() {
        return partsTotal;
    }

    public void setPartsTotal(Double partsTotal) {
        this.partsTotal = partsTotal;
    }

    public Double getShopSuppliesFee() {
        return shopSuppliesFee;
    }

    public void setShopSuppliesFee(Double shopSuppliesFee) {
        this.shopSuppliesFee = shopSuppliesFee;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public Double getTaxPercentage() {
        return taxPercentage;
    }

    public void setTaxPercentage(Double taxPercentage) {
        this.taxPercentage = taxPercentage;
    }

    public Double getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(Double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public List<InvoiceLineItem> getLineItems() {
        return lineItems;
    }

    public void setLineItems(List<InvoiceLineItem> lineItems) {
        this.lineItems = lineItems;
    }
}
