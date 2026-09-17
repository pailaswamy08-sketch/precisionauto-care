package com.precisionauto.record.client;

import com.precisionauto.record.dto.InvoiceGenerationRequest;
import com.precisionauto.record.dto.InvoiceResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "billing-service", path = "/api/billing")
public interface BillingClient {

    @PostMapping("/invoices/generate")
    InvoiceResponseDto generateInvoice(@RequestBody InvoiceGenerationRequest request);
}
