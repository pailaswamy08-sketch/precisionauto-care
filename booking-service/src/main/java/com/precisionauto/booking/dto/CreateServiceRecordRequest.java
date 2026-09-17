package com.precisionauto.booking.dto;

public class CreateServiceRecordRequest {
    private String bookingReference;
    private Long bookingId;
    private String vehicleVin;
    private String vehiclePlate;
    private String vehicleModel;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String servicePackage;
    private String bayNumber;
    private String scheduledDate;
    private String timeSlot;
    private String initialNotes;

    public CreateServiceRecordRequest() {}

    public CreateServiceRecordRequest(String bookingReference, Long bookingId, String vehicleVin, String vehiclePlate,
                                      String vehicleModel, String customerName, String customerEmail, String customerPhone,
                                      String servicePackage, String bayNumber, String scheduledDate, String timeSlot, String initialNotes) {
        this.bookingReference = bookingReference;
        this.bookingId = bookingId;
        this.vehicleVin = vehicleVin;
        this.vehiclePlate = vehiclePlate;
        this.vehicleModel = vehicleModel;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.servicePackage = servicePackage;
        this.bayNumber = bayNumber;
        this.scheduledDate = scheduledDate;
        this.timeSlot = timeSlot;
        this.initialNotes = initialNotes;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
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

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getInitialNotes() {
        return initialNotes;
    }

    public void setInitialNotes(String initialNotes) {
        this.initialNotes = initialNotes;
    }
}
