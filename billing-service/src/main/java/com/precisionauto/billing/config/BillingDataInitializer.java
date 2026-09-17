package com.precisionauto.billing.config;

import com.precisionauto.billing.model.Invoice;
import com.precisionauto.billing.model.InvoiceLineItem;
import com.precisionauto.billing.model.PaymentStatus;
import com.precisionauto.billing.repository.InvoiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class BillingDataInitializer implements CommandLineRunner {

    private final InvoiceRepository invoiceRepository;

    public BillingDataInitializer(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public void run(String... args) {
        if (invoiceRepository.count() == 0) {
            Invoice inv1 = new Invoice();
            inv1.setInvoiceNumber("INV-2026-001");
            inv1.setServiceRecordId(1L);
            inv1.setBookingReference("BK-HIST-01");
            inv1.setVehicleVin("1FTFW1E84KFA12091");
            inv1.setVehiclePlate("FL-882-TR");
            inv1.setVehicleModel("Ford Transit Cargo 250");
            inv1.setCustomerName("Alex Mercer");
            inv1.setCustomerEmail("alex@fleetcorp.com");
            inv1.setCustomerPhone("+1 555-0103");
            inv1.setServiceDescription("Major 30k Mile Preventative Inspection - Replaced EVAP purge valve solenoid and fluids.");
            inv1.setLaborHours(2.5);
            inv1.setLaborRatePerHour(95.0);
            inv1.setShopSuppliesFee(18.50);
            inv1.setDiscountPercentage(5.0);
            inv1.setTaxPercentage(18.0);
            inv1.setPaymentStatus(PaymentStatus.PAID);
            inv1.setPaymentMethod("FLEET_CREDIT");
            inv1.setCreatedAt(LocalDateTime.now().minusDays(14));
            inv1.setPaidAt(LocalDateTime.now().minusDays(14).plusMinutes(20));

            inv1.addLineItem(new InvoiceLineItem(null, "LABOR", "LABOR-STD", "Technician Labor (2.5 hrs @ $95.00/hr)", 2.5, 95.0, inv1));
            inv1.addLineItem(new InvoiceLineItem(null, "PART", "FLT-EVAP-101", "OEM EVAP Purge Solenoid", 1.0, 68.50, inv1));
            inv1.addLineItem(new InvoiceLineItem(null, "PART", "OIL-5W30-FLT", "Motorcraft Synthetic Blend 5W-30 (6 Qt)", 1.0, 42.00, inv1));
            inv1.addLineItem(new InvoiceLineItem(null, "PART", "FLT-FLT-09", "Heavy Duty Engine Oil Filter", 1.0, 14.50, inv1));
            inv1.addLineItem(new InvoiceLineItem(null, "FEE", "FEE-SUPPLIES", "Shop Consumables & Environmental Disposal Fee", 1.0, 18.50, inv1));

            inv1.calculateDynamicTotals();
            invoiceRepository.save(inv1);

            System.out.println(">>> PrecisionAuto Billing Service: Pre-seeded sample invoice data.");
        }
    }
}
