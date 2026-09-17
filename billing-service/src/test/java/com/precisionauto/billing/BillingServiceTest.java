package com.precisionauto.billing;

import com.precisionauto.billing.dto.InvoiceGenerationRequest;
import com.precisionauto.billing.dto.PartItemDto;
import com.precisionauto.billing.dto.PaymentRequest;
import com.precisionauto.billing.model.Invoice;
import com.precisionauto.billing.model.PaymentStatus;
import com.precisionauto.billing.repository.InvoiceRepository;
import com.precisionauto.billing.service.BillingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class BillingServiceTest {

    @Autowired
    private BillingService billingService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @BeforeEach
    void setUp() {
        invoiceRepository.deleteAll();
    }

    @Test
    @DisplayName("Should dynamically calculate invoice subtotal, tax (18%), discount, and total")
    void testDynamicInvoiceCalculation() {
        InvoiceGenerationRequest req = new InvoiceGenerationRequest();
        req.setServiceRecordId(999L);
        req.setBookingReference("BK-TEST-999");
        req.setVehicleVin("1FTFW1E84KFA99999");
        req.setVehiclePlate("TEST-88");
        req.setVehicleModel("Ford Transit 250");
        req.setCustomerName("Logistics Corp");
        req.setCustomerEmail("admin@logisticscorp.com");
        req.setServiceDescription("Brake Service & Fluid Replacement");
        req.setLaborHours(2.0);
        req.setLaborRatePerHour(100.0); // Labor = 2.0 * 100 = 200.00
        req.setDiscountPercentage(10.0); // 10% discount

        PartItemDto p1 = new PartItemDto("PAD-01", "Heavy Brake Pads", 2, 50.0, 100.0);
        PartItemDto p2 = new PartItemDto("OIL-01", "Synthetic Brake Fluid", 1, 20.0, 20.0);
        req.setParts(List.of(p1, p2)); // Parts = 100 + 20 = 120.00
        // Shop supplies fee = 18.50
        // Subtotal = 200 + 120 + 18.50 = 338.50
        // Discount 10% of 338.50 = 33.85
        // Taxable = 338.50 - 33.85 = 304.65
        // Tax 18% of 304.65 = 54.84
        // Total = 304.65 + 54.84 = 359.49

        Invoice inv = billingService.generateInvoice(req);

        assertNotNull(inv.getId());
        assertNotNull(inv.getInvoiceNumber());
        assertEquals(200.0, inv.getLaborTotal());
        assertEquals(120.0, inv.getPartsTotal());
        assertEquals(18.50, inv.getShopSuppliesFee());
        assertEquals(338.50, inv.getSubtotal());
        assertEquals(33.85, inv.getDiscountAmount());
        assertEquals(54.84, inv.getTaxAmount());
        assertEquals(359.49, inv.getTotalAmount());
        assertEquals(PaymentStatus.PENDING, inv.getPaymentStatus());
        assertEquals(4, inv.getLineItems().size()); // 1 labor + 2 parts + 1 shop fee
    }

    @Test
    @DisplayName("Should process payment and update status to PAID")
    void testPaymentProcessing() {
        InvoiceGenerationRequest req = new InvoiceGenerationRequest();
        req.setServiceRecordId(888L);
        req.setCustomerName("John Doe");
        req.setCustomerEmail("john@test.com");
        req.setVehicleVin("VIN88888888888888");
        req.setVehiclePlate("JD-888");
        req.setLaborHours(1.0);
        req.setLaborRatePerHour(80.0);

        Invoice inv = billingService.generateInvoice(req);
        assertEquals(PaymentStatus.PENDING, inv.getPaymentStatus());

        PaymentRequest payReq = new PaymentRequest("CORPORATE_CREDIT_CARD", "Paid in full at checkout");
        Invoice paidInv = billingService.processPayment(inv.getId(), payReq);

        assertEquals(PaymentStatus.PAID, paidInv.getPaymentStatus());
        assertEquals("CORPORATE_CREDIT_CARD", paidInv.getPaymentMethod());
        assertNotNull(paidInv.getPaidAt());
    }
}
