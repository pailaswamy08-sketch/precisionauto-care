package com.precisionauto.record.dto;

import java.util.List;

public class CompleteServiceRequest {
    private Double laborHours;
    private Double laborRate;
    private String technicianNotes;
    private Integer finalOdometer;
    private String dtcResolved;
    private Double discountPercentage = 0.0;
    private List<AddPartRequest> additionalParts;

    public CompleteServiceRequest() {}

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

    public String getTechnicianNotes() {
        return technicianNotes;
    }

    public void setTechnicianNotes(String technicianNotes) {
        this.technicianNotes = technicianNotes;
    }

    public Integer getFinalOdometer() {
        return finalOdometer;
    }

    public void setFinalOdometer(Integer finalOdometer) {
        this.finalOdometer = finalOdometer;
    }

    public String getDtcResolved() {
        return dtcResolved;
    }

    public void setDtcResolved(String dtcResolved) {
        this.dtcResolved = dtcResolved;
    }

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public List<AddPartRequest> getAdditionalParts() {
        return additionalParts;
    }

    public void setAdditionalParts(List<AddPartRequest> additionalParts) {
        this.additionalParts = additionalParts;
    }
}
