package com.precisionauto.billing.service;

import com.precisionauto.billing.dto.BillingStatsDto;
import com.precisionauto.billing.dto.InvoiceGenerationRequest;
import com.precisionauto.billing.dto.PartItemDto;
import com.precisionauto.billing.dto.PaymentRequest;
import com.precisionauto.billing.model.Invoice;
import com.precisionauto.billing.model.InvoiceLineItem;
import com.precisionauto.billing.model.PaymentStatus;
import com.precisionauto.billing.repository.InvoiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final InvoiceRepository invoiceRepository;

    public BillingService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public Invoice generateInvoice(InvoiceGenerationRequest req) {
        // Prevent duplicate invoice creation for the same service record
        Optional<Invoice> existing = invoiceRepository.findByServiceRecordId(req.getServiceRecordId());
        if (existing.isPresent()) {
            log.info("Invoice already exists for service record ID {}: {}", req.getServiceRecordId(), existing.get().getInvoiceNumber());
            return existing.get();
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-2026-" + (System.currentTimeMillis() % 1000000));
        invoice.setServiceRecordId(req.getServiceRecordId());
        invoice.setBookingReference(req.getBookingReference());
        invoice.setVehicleVin(req.getVehicleVin().trim().toUpperCase());
        invoice.setVehiclePlate(req.getVehiclePlate().trim().toUpperCase());
        invoice.setVehicleModel(req.getVehicleModel());
        invoice.setCustomerName(req.getCustomerName());
        invoice.setCustomerEmail(req.getCustomerEmail());
        invoice.setCustomerPhone(req.getCustomerPhone());
        invoice.setServiceDescription(req.getServiceDescription());

        double laborHours = (req.getLaborHours() != null) ? req.getLaborHours() : 1.0;
        double laborRate = (req.getLaborRatePerHour() != null) ? req.getLaborRatePerHour() : 95.0;
        invoice.setLaborHours(laborHours);
        invoice.setLaborRatePerHour(laborRate);

        invoice.setDiscountPercentage(req.getDiscountPercentage() != null ? req.getDiscountPercentage() : 0.0);
        invoice.setTaxPercentage(18.0); // 18% standard GST
        invoice.setShopSuppliesFee(18.50);
        invoice.setPaymentStatus(PaymentStatus.PENDING);

        // Add Labor Line Item
        InvoiceLineItem laborItem = new InvoiceLineItem(
                null, "LABOR", "LABOR-STD",
                String.format("Technician Labor (%s hrs @ $%.2f/hr)", laborHours, laborRate),
                laborHours, laborRate, invoice
        );
        invoice.addLineItem(laborItem);

        // Add Part Line Items
        if (req.getParts() != null && !req.getParts().isEmpty()) {
            for (PartItemDto p : req.getParts()) {
                double qty = (p.getQuantity() != null) ? p.getQuantity().doubleValue() : 1.0;
                double price = (p.getUnitPrice() != null) ? p.getUnitPrice() : 0.0;
                InvoiceLineItem partItem = new InvoiceLineItem(
                        null, "PART", p.getPartNumber(), p.getPartName(), qty, price, invoice
                );
                invoice.addLineItem(partItem);
            }
        }

        // Add Shop Supplies / Eco Disposal Line Item
        InvoiceLineItem suppliesItem = new InvoiceLineItem(
                null, "FEE", "FEE-SUPPLIES",
                "Shop Consumables, Environmental & EPA Disposal Fee",
                1.0, 18.50, invoice
        );
        invoice.addLineItem(suppliesItem);

        // Recalculate dynamic totals
        invoice.calculateDynamicTotals();

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Generated Dynamic Invoice {} for Record {} - Total Amount: ${}",
                saved.getInvoiceNumber(), saved.getServiceRecordId(), saved.getTotalAmount());
        return saved;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + id));
    }

    public Invoice getInvoiceByServiceRecordId(Long recordId) {
        return invoiceRepository.findByServiceRecordId(recordId)
                .orElseThrow(() -> new RuntimeException("No invoice found for service record ID: " + recordId));
    }

    public List<Invoice> getInvoicesByCustomerEmail(String email) {
        return invoiceRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email.trim());
    }

    @Transactional
    public Invoice processPayment(Long invoiceId, PaymentRequest req) {
        Invoice invoice = getInvoiceById(invoiceId);
        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            return invoice;
        }

        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice.setPaymentMethod(req.getPaymentMethod());
        invoice.setPaidAt(LocalDateTime.now());
        log.info("Invoice {} marked as PAID via {}", invoice.getInvoiceNumber(), req.getPaymentMethod());
        return invoiceRepository.save(invoice);
    }

    public BillingStatsDto getBillingStats() {
        List<Invoice> all = invoiceRepository.findAll();
        double totalPaid = all.stream()
                .filter(i -> i.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(Invoice::getTotalAmount)
                .sum();
        double totalPending = all.stream()
                .filter(i -> i.getPaymentStatus() == PaymentStatus.PENDING)
                .mapToDouble(Invoice::getTotalAmount)
                .sum();

        long paidCount = all.stream().filter(i -> i.getPaymentStatus() == PaymentStatus.PAID).count();
        long pendingCount = all.stream().filter(i -> i.getPaymentStatus() == PaymentStatus.PENDING).count();
        double avgValue = all.isEmpty() ? 0.0 : all.stream().mapToDouble(Invoice::getTotalAmount).average().orElse(0.0);

        return new BillingStatsDto(
                Math.round(totalPaid * 100.0) / 100.0,
                Math.round(totalPending * 100.0) / 100.0,
                (long) all.size(),
                paidCount,
                pendingCount,
                Math.round(avgValue * 100.0) / 100.0
        );
    }
}
