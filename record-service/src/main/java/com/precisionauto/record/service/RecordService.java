package com.precisionauto.record.service;

import com.precisionauto.record.client.BillingClient;
import com.precisionauto.record.dto.*;
import com.precisionauto.record.model.PartItem;
import com.precisionauto.record.model.ServiceRecord;
import com.precisionauto.record.model.ServiceStatus;
import com.precisionauto.record.repository.PartItemRepository;
import com.precisionauto.record.repository.ServiceRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecordService {

    private static final Logger log = LoggerFactory.getLogger(RecordService.class);

    private final ServiceRecordRepository recordRepository;
    private final PartItemRepository partItemRepository;
    private final BillingClient billingClient;

    public RecordService(ServiceRecordRepository recordRepository,
                         PartItemRepository partItemRepository,
                         BillingClient billingClient) {
        this.recordRepository = recordRepository;
        this.partItemRepository = partItemRepository;
        this.billingClient = billingClient;
    }

    @Transactional
    public ServiceRecord initializeRecord(CreateRecordRequest req) {
        ServiceRecord record = new ServiceRecord();
        record.setRecordNumber("REC-" + (System.currentTimeMillis() % 1000000));
        record.setBookingReference(req.getBookingReference());
        record.setVehicleVin(req.getVehicleVin().trim().toUpperCase());
        record.setVehiclePlate(req.getVehiclePlate().trim().toUpperCase());
        record.setVehicleModel(req.getVehicleModel());
        record.setCustomerName(req.getCustomerName());
        record.setCustomerEmail(req.getCustomerEmail());
        record.setCustomerPhone(req.getCustomerPhone());
        record.setServicePackage(req.getServicePackage());
        record.setBayNumber(req.getBayNumber());
        record.setServiceStatus(ServiceStatus.SCHEDULED);
        record.setTechnicianNotes(req.getInitialNotes() != null ? req.getInitialNotes() : "Initial service ticket booked.");
        record.setLaborRate(95.0);

        ServiceRecord saved = recordRepository.save(record);
        log.info("Initialized Service Record {} for Vehicle {} (VIN: {})",
                saved.getRecordNumber(), saved.getVehiclePlate(), saved.getVehicleVin());
        return saved;
    }

    public List<ServiceRecord> getAllRecords() {
        return recordRepository.findAll();
    }

    public ServiceRecord getRecordById(Long id) {
        return recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service record not found with id: " + id));
    }

    public List<ServiceRecord> getRecordsByVin(String vin) {
        return recordRepository.findByVehicleVinOrderByCreatedAtDesc(vin.trim().toUpperCase());
    }

    public List<ServiceRecord> getRecordsByPlate(String plate) {
        return recordRepository.findByVehiclePlateIgnoreCaseOrderByCreatedAtDesc(plate.trim());
    }

    @Transactional
    public ServiceRecord updateStatus(Long id, ServiceStatus status) {
        ServiceRecord record = getRecordById(id);
        record.setServiceStatus(status);
        if (status == ServiceStatus.COMPLETED && record.getCompletedAt() == null) {
            record.setCompletedAt(LocalDateTime.now());
        }
        return recordRepository.save(record);
    }

    @Transactional
    public ServiceRecord assignTechnician(Long id, Long techId, String techName) {
        ServiceRecord record = getRecordById(id);
        record.setAssignedTechnicianId(techId);
        record.setAssignedTechnicianName(techName);
        if (record.getServiceStatus() == ServiceStatus.SCHEDULED) {
            record.setServiceStatus(ServiceStatus.IN_INSPECTION);
        }
        return recordRepository.save(record);
    }

    @Transactional
    public ServiceRecord addPart(Long recordId, AddPartRequest req) {
        ServiceRecord record = getRecordById(idOrThrow(recordId));
        PartItem part = new PartItem(null, req.getPartNumber(), req.getPartName(), req.getQuantity(), req.getUnitPrice(), record);
        record.addPart(part);
        return recordRepository.save(record);
    }

    @Transactional
    public ServiceRecord completeService(Long recordId, CompleteServiceRequest req) {
        ServiceRecord record = getRecordById(recordId);

        if (req.getLaborHours() != null) {
            record.setLaborHours(req.getLaborHours());
        }
        if (req.getLaborRate() != null) {
            record.setLaborRate(req.getLaborRate());
        }
        if (req.getTechnicianNotes() != null) {
            record.setTechnicianNotes(req.getTechnicianNotes());
        }
        if (req.getFinalOdometer() != null) {
            record.setCurrentOdometer(req.getFinalOdometer());
        }
        if (req.getDtcResolved() != null) {
            record.setDtcCodes("RESOLVED: " + req.getDtcResolved());
        }

        // Add additional parts if submitted
        if (req.getAdditionalParts() != null && !req.getAdditionalParts().isEmpty()) {
            for (AddPartRequest apr : req.getAdditionalParts()) {
                PartItem part = new PartItem(null, apr.getPartNumber(), apr.getPartName(), apr.getQuantity(), apr.getUnitPrice(), record);
                record.addPart(part);
            }
        }

        record.setCompletedAt(LocalDateTime.now());
        record.setServiceStatus(ServiceStatus.COMPLETED);
        ServiceRecord saved = recordRepository.save(record);

        // Inter-service Call: Trigger dynamic invoice generation in Billing Service
        try {
            List<PartItemDto> partsDto = saved.getParts().stream()
                    .map(p -> new PartItemDto(p.getPartNumber(), p.getPartName(), p.getQuantity(), p.getUnitPrice(), p.getTotalPrice()))
                    .collect(Collectors.toList());

            InvoiceGenerationRequest invoiceReq = new InvoiceGenerationRequest();
            invoiceReq.setServiceRecordId(saved.getId());
            invoiceReq.setRecordNumber(saved.getRecordNumber());
            invoiceReq.setBookingReference(saved.getBookingReference());
            invoiceReq.setVehicleVin(saved.getVehicleVin());
            invoiceReq.setVehiclePlate(saved.getVehiclePlate());
            invoiceReq.setVehicleModel(saved.getVehicleModel());
            invoiceReq.setCustomerName(saved.getCustomerName());
            invoiceReq.setCustomerEmail(saved.getCustomerEmail());
            invoiceReq.setCustomerPhone(saved.getCustomerPhone());
            invoiceReq.setServiceDescription(saved.getServicePackage() + " - " + (saved.getTechnicianNotes() != null ? saved.getTechnicianNotes() : "Repair completed"));
            invoiceReq.setLaborHours(saved.getLaborHours() != null ? saved.getLaborHours() : 1.0);
            invoiceReq.setLaborRatePerHour(saved.getLaborRate() != null ? saved.getLaborRate() : 95.0);
            invoiceReq.setParts(partsDto);
            invoiceReq.setDiscountPercentage(req.getDiscountPercentage() != null ? req.getDiscountPercentage() : 0.0);

            InvoiceResponseDto invoiceResp = billingClient.generateInvoice(invoiceReq);
            if (invoiceResp != null) {
                saved.setInvoiceId(invoiceResp.getId());
                saved.setInvoiceNumber(invoiceResp.getInvoiceNumber());
                saved.setServiceStatus(ServiceStatus.INVOICED);
                saved = recordRepository.save(saved);
                log.info("Successfully generated Dynamic Invoice {} for Record {}",
                        invoiceResp.getInvoiceNumber(), saved.getRecordNumber());
            }
        } catch (Exception e) {
            log.warn("Billing Service call failed or deferred: {}", e.getMessage());
        }

        return saved;
    }

    private Long idOrThrow(Long id) {
        if (id == null) throw new IllegalArgumentException("Record ID cannot be null");
        return id;
    }
}
