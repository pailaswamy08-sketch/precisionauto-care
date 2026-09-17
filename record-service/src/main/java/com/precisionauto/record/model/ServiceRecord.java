package com.precisionauto.record.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_records")
public class ServiceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String recordNumber;

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

    @Column(nullable = false)
    private String servicePackage;

    private String bayNumber;

    private Long assignedTechnicianId;
    private String assignedTechnicianName;

    private Integer currentOdometer;

    private String dtcCodes; // Diagnostic Trouble Codes (e.g. P0300, P0420)

    @Column(length = 2000)
    private String technicianNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceStatus serviceStatus = ServiceStatus.SCHEDULED;

    private Double laborHours = 0.0;
    private Double laborRate = 95.0;

    @OneToMany(mappedBy = "serviceRecord", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PartItem> parts = new ArrayList<>();

    private Long invoiceId;
    private String invoiceNumber;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public ServiceRecord() {
        this.createdAt = LocalDateTime.now();
    }

    public void addPart(PartItem part) {
        parts.add(part);
        part.setServiceRecord(this);
    }

    public void removePart(PartItem part) {
        parts.remove(part);
        part.setServiceRecord(null);
    }

    public Double calculateTotalPartsCost() {
        return parts.stream().mapToDouble(p -> p.getTotalPrice() != null ? p.getTotalPrice() : 0.0).sum();
    }

    public Double calculateTotalLaborCost() {
        return (laborHours != null && laborRate != null) ? laborHours * laborRate : 0.0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecordNumber() {
        return recordNumber;
    }

    public void setRecordNumber(String recordNumber) {
        this.recordNumber = recordNumber;
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

    public String getServicePackage() {
        return servicePackage;
    }

    public void setServicePackage(String servicePackage) {
        this.servicePackage = servicePackage;
    }

    public String getBayNumber() {
        return bayNumber;
    }

    public void setBayNumber(String bayNumber) {
        this.bayNumber = bayNumber;
    }

    public Long getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(Long assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }

    public String getAssignedTechnicianName() {
        return assignedTechnicianName;
    }

    public void setAssignedTechnicianName(String assignedTechnicianName) {
        this.assignedTechnicianName = assignedTechnicianName;
    }

    public Integer getCurrentOdometer() {
        return currentOdometer;
    }

    public void setCurrentOdometer(Integer currentOdometer) {
        this.currentOdometer = currentOdometer;
    }

    public String getDtcCodes() {
        return dtcCodes;
    }

    public void setDtcCodes(String dtcCodes) {
        this.dtcCodes = dtcCodes;
    }

    public String getTechnicianNotes() {
        return technicianNotes;
    }

    public void setTechnicianNotes(String technicianNotes) {
        this.technicianNotes = technicianNotes;
    }

    public ServiceStatus getServiceStatus() {
        return serviceStatus;
    }

    public void setServiceStatus(ServiceStatus serviceStatus) {
        this.serviceStatus = serviceStatus;
    }

    public Double getLaborHours() {
        return laborHours;
    }

    public void setLaborHours(Double laborHours) {
        this.laborHours = laborHours;
    }

    public Double getLaborRate() {
        return laborRate;
    }

    public void setLaborRate(Double laborRate) {
        this.laborRate = laborRate;
    }

    public List<PartItem> getParts() {
        return parts;
    }

    public void setParts(List<PartItem> parts) {
        this.parts = parts;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
