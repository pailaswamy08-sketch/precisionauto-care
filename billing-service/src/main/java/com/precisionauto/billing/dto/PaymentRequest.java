package com.precisionauto.billing.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentRequest {

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // e.g., "CORPORATE_CARD", "FLEET_CREDIT", "ACH_TRANSFER"

    private String transactionNotes;

    public PaymentRequest() {}

    public PaymentRequest(String paymentMethod, String transactionNotes) {
        this.paymentMethod = paymentMethod;
        this.transactionNotes = transactionNotes;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionNotes() {
        return transactionNotes;
    }

    public void setTransactionNotes(String transactionNotes) {
        this.transactionNotes = transactionNotes;
    }
}
