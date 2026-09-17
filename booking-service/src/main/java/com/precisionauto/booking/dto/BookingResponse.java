package com.precisionauto.booking.dto;

import com.precisionauto.booking.model.Booking;
import com.precisionauto.booking.model.BookingStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long bayId;
    private String bayNumber;
    private String bayName;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String vehicleVin;
    private String vehiclePlate;
    private String vehicleModel;
    private String servicePackage;
    private LocalDate bookingDate;
    private String timeSlot;
    private BookingStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private Long serviceRecordId;

    public BookingResponse() {}

    public static BookingResponse fromEntity(Booking b) {
        BookingResponse res = new BookingResponse();
        res.setId(b.getId());
        res.setBookingReference(b.getBookingReference());
        if (b.getBay() != null) {
            res.setBayId(b.getBay().getId());
            res.setBayNumber(b.getBay().getBayNumber());
            res.setBayName(b.getBay().getBayName());
        }
        res.setCustomerId(b.getCustomerId());
        res.setCustomerName(b.getCustomerName());
        res.setCustomerEmail(b.getCustomerEmail());
        res.setCustomerPhone(b.getCustomerPhone());
        res.setVehicleVin(b.getVehicleVin());
        res.setVehiclePlate(b.getVehiclePlate());
        res.setVehicleModel(b.getVehicleModel());
        res.setServicePackage(b.getServicePackage());
        res.setBookingDate(b.getBookingDate());
        res.setTimeSlot(b.getTimeSlot());
        res.setStatus(b.getStatus());
        res.setNotes(b.getNotes());
        res.setCreatedAt(b.getCreatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getBayId() {
        return bayId;
    }

    public void setBayId(Long bayId) {
        this.bayId = bayId;
    }

    public String getBayNumber() {
        return bayNumber;
    }

    public void setBayNumber(String bayNumber) {
        this.bayNumber = bayNumber;
    }

    public String getBayName() {
        return bayName;
    }

    public void setBayName(String bayName) {
        this.bayName = bayName;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
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

    public String getServicePackage() {
        return servicePackage;
    }

    public void setServicePackage(String servicePackage) {
        this.servicePackage = servicePackage;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getServiceRecordId() {
        return serviceRecordId;
    }

    public void setServiceRecordId(Long serviceRecordId) {
        this.serviceRecordId = serviceRecordId;
    }
}
