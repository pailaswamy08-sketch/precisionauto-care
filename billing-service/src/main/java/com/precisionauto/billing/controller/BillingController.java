package com.precisionauto.billing.controller;

import com.precisionauto.billing.dto.BillingStatsDto;
import com.precisionauto.billing.dto.InvoiceGenerationRequest;
import com.precisionauto.billing.dto.PaymentRequest;
import com.precisionauto.billing.model.Invoice;
import com.precisionauto.billing.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/invoices/generate")
    public ResponseEntity<Invoice> generateInvoice(@Valid @RequestBody InvoiceGenerationRequest request) {
        Invoice created = billingService.generateInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @GetMapping("/invoices/record/{recordId}")
    public ResponseEntity<Invoice> getInvoiceByRecordId(@PathVariable Long recordId) {
        return ResponseEntity.ok(billingService.getInvoiceByServiceRecordId(recordId));
    }

    @GetMapping("/invoices/customer")
    public ResponseEntity<List<Invoice>> getInvoicesByCustomer(@RequestParam String email) {
        return ResponseEntity.ok(billingService.getInvoicesByCustomerEmail(email));
    }

    @PutMapping("/invoices/{id}/pay")
    public ResponseEntity<Invoice> processPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(billingService.processPayment(id, request));
    }

    @GetMapping("/stats")
    public ResponseEntity<BillingStatsDto> getBillingStats() {
        return ResponseEntity.ok(billingService.getBillingStats());
    }
}
