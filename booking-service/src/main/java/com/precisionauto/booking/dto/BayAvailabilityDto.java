package com.precisionauto.booking.dto;

import com.precisionauto.booking.model.BayType;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BayAvailabilityDto {
    private Long bayId;
    private String bayNumber;
    private String bayName;
    private BayType bayType;
    private boolean isOperational;
    private Double hourlyRate;
    private LocalDate date;
    private List<SlotStatusDto> slots = new ArrayList<>();

    public BayAvailabilityDto() {}

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

    public BayType getBayType() {
        return bayType;
    }

    public void setBayType(BayType bayType) {
        this.bayType = bayType;
    }

    public boolean isOperational() {
        return isOperational;
    }

    public void setOperational(boolean operational) {
        isOperational = operational;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<SlotStatusDto> getSlots() {
        return slots;
    }

    public void setSlots(List<SlotStatusDto> slots) {
        this.slots = slots;
    }
}
