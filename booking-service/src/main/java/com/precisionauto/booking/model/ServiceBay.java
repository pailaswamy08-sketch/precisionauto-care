package com.precisionauto.booking.model;

import jakarta.persistence.*;

@Entity
@Table(name = "service_bays")
public class ServiceBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bayNumber;

    @Column(nullable = false)
    private String bayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BayType bayType;

    private boolean isOperational = true;

    private Double hourlyRate = 95.0;

    public ServiceBay() {}

    public ServiceBay(Long id, String bayNumber, String bayName, BayType bayType, boolean isOperational, Double hourlyRate) {
        this.id = id;
        this.bayNumber = bayNumber;
        this.bayName = bayName;
        this.bayType = bayType;
        this.isOperational = isOperational;
        this.hourlyRate = hourlyRate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
