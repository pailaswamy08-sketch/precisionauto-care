package com.precisionauto.billing.repository;

import com.precisionauto.billing.model.Invoice;
import com.precisionauto.billing.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findByServiceRecordId(Long serviceRecordId);
    List<Invoice> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
    List<Invoice> findByVehicleVinOrderByCreatedAtDesc(String vehicleVin);
    List<Invoice> findByPaymentStatus(PaymentStatus paymentStatus);
}
