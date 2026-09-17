package com.precisionauto.booking.dto;

public class SlotStatusDto {
    private String timeSlot;
    private boolean available;
    private String status; // "AVAILABLE", "OCCUPIED", "UNDER_MAINTENANCE"
    private String bookingReference;
    private String vehiclePlate;
    private String customerName;

    public SlotStatusDto() {}

    public SlotStatusDto(String timeSlot, boolean available, String status, String bookingReference, String vehiclePlate, String customerName) {
        this.timeSlot = timeSlot;
        this.available = available;
        this.status = status;
        this.bookingReference = bookingReference;
        this.vehiclePlate = vehiclePlate;
        this.customerName = customerName;
    }

    public static SlotStatusDto available(String timeSlot) {
        return new SlotStatusDto(timeSlot, true, "AVAILABLE", null, null, null);
    }

    public static SlotStatusDto occupied(String timeSlot, String bookingReference, String vehiclePlate, String customerName) {
        return new SlotStatusDto(timeSlot, false, "OCCUPIED", bookingReference, vehiclePlate, customerName);
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public String getVehiclePlate() {
        return vehiclePlate;
    }

    public void setVehiclePlate(String vehiclePlate) {
        this.vehiclePlate = vehiclePlate;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}
