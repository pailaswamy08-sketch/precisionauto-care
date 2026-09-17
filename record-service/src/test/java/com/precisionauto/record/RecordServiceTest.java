package com.precisionauto.record;

import com.precisionauto.record.client.BillingClient;
import com.precisionauto.record.dto.*;
import com.precisionauto.record.model.ServiceRecord;
import com.precisionauto.record.model.ServiceStatus;
import com.precisionauto.record.repository.ServiceRecordRepository;
import com.precisionauto.record.service.RecordService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecordServiceTest {

    @Autowired
    private RecordService recordService;

    @Autowired
    private ServiceRecordRepository recordRepository;

    @MockBean
    private BillingClient billingClient;

    @BeforeEach
    void setUp() {
        recordRepository.deleteAll();

        // Configure mock billing client
        InvoiceResponseDto mockInvoice = new InvoiceResponseDto();
        mockInvoice.setId(555L);
        mockInvoice.setInvoiceNumber("INV-2026-TEST555");
        mockInvoice.setSubtotal(300.0);
        mockInvoice.setTotalAmount(354.0);
        mockInvoice.setPaymentStatus("PENDING");

        Mockito.when(billingClient.generateInvoice(any(InvoiceGenerationRequest.class)))
                .thenReturn(mockInvoice);
    }

    @Test
    @DisplayName("Should initialize service record from booking and assign technician")
    void testInitializeAndAssign() {
        CreateRecordRequest req = new CreateRecordRequest();
        req.setBookingReference("BK-TEST-INIT");
        req.setVehicleVin("1FTFW1E84KFA55555");
        req.setVehiclePlate("FL-555-ZZ");
        req.setVehicleModel("Ford Transit 250");
        req.setCustomerName("Logistics Corp");
        req.setServicePackage("Brake Overhaul");
        req.setBayNumber("BAY-02");

        ServiceRecord record = recordService.initializeRecord(req);

        assertNotNull(record.getId());
        assertEquals("SCHEDULED", record.getServiceStatus().name());
        assertEquals("1FTFW1E84KFA55555", record.getVehicleVin());

        // Assign Technician
        ServiceRecord assigned = recordService.assignTechnician(record.getId(), 2L, "Johnathan Miller");
        assertEquals("IN_INSPECTION", assigned.getServiceStatus().name());
        assertEquals("Johnathan Miller", assigned.getAssignedTechnicianName());
    }

    @Test
    @DisplayName("Should add replacement parts and trigger billing invoice on completion")
    void testPartsAndCompleteService() {
        CreateRecordRequest req = new CreateRecordRequest();
        req.setBookingReference("BK-TEST-PARTS");
        req.setVehicleVin("2C4RC1CG5KR999999");
        req.setVehiclePlate("LG-999-XP");
        req.setVehicleModel("Freightliner M2");
        req.setCustomerName("Maria Santos");
        req.setServicePackage("Air Brake Repair");
        req.setBayNumber("BAY-02");

        ServiceRecord record = recordService.initializeRecord(req);

        // Add Part
        AddPartRequest part = new AddPartRequest("PAD-HEAVY-01", "Severe Duty Brake Pads", 2, 85.0);
        ServiceRecord withPart = recordService.addPart(record.getId(), part);
        assertEquals(1, withPart.getParts().size());
        assertEquals(170.0, withPart.calculateTotalPartsCost());

        // Complete Service
        CompleteServiceRequest compReq = new CompleteServiceRequest();
        compReq.setLaborHours(3.0);
        compReq.setLaborRate(110.0);
        compReq.setFinalOdometer(92400);
        compReq.setTechnicianNotes("Pneumatics pressure tested to 125 PSI.");

        ServiceRecord completed = recordService.completeService(record.getId(), compReq);

        assertNotNull(completed.getCompletedAt());
        assertEquals(ServiceStatus.INVOICED, completed.getServiceStatus());
        assertEquals("INV-2026-TEST555", completed.getInvoiceNumber());
        assertEquals(555L, completed.getInvoiceId());

        // Verify BillingClient was called via OpenFeign
        Mockito.verify(billingClient, Mockito.times(1))
                .generateInvoice(any(InvoiceGenerationRequest.class));
    }
}
