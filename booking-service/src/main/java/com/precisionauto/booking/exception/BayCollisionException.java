package com.precisionauto.booking.exception;

public class BayCollisionException extends RuntimeException {
    private final Long bayId;
    private final String bayNumber;
    private final String date;
    private final String timeSlot;

    public BayCollisionException(String message, Long bayId, String bayNumber, String date, String timeSlot) {
        super(message);
        this.bayId = bayId;
        this.bayNumber = bayNumber;
        this.date = date;
        this.timeSlot = timeSlot;
    }

    public Long getBayId() {
        return bayId;
    }

    public String getBayNumber() {
        return bayNumber;
    }

    public String getDate() {
        return date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }
}
