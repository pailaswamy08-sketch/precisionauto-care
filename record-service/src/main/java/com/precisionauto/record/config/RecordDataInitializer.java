package com.precisionauto.record.config;

import com.precisionauto.record.model.PartItem;
import com.precisionauto.record.model.ServiceRecord;
import com.precisionauto.record.model.ServiceStatus;
import com.precisionauto.record.repository.ServiceRecordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class RecordDataInitializer implements CommandLineRunner {

    private final ServiceRecordRepository recordRepository;

    public RecordDataInitializer(ServiceRecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    @Override
    public void run(String... args) {
        if (recordRepository.count() == 0) {
            // Record 1: Past completed service for Ford Transit
            ServiceRecord r1 = new ServiceRecord();
            r1.setRecordNumber("REC-88019");
            r1.setBookingReference("BK-HIST-01");
            r1.setVehicleVin("1FTFW1E84KFA12091");
            r1.setVehiclePlate("FL-882-TR");
            r1.setVehicleModel("Ford Transit Cargo 250");
            r1.setCustomerName("Alex Mercer");
            r1.setCustomerEmail("alex@fleetcorp.com");
            r1.setCustomerPhone("+1 555-0103");
            r1.setServicePackage("Major 30k Mile Preventative Inspection");
            r1.setBayNumber("BAY-03");
            r1.setAssignedTechnicianId(2L);
            r1.setAssignedTechnicianName("Johnathan Miller");
            r1.setCurrentOdometer(31250);
            r1.setDtcCodes("RESOLVED: P0456 (Evaporative Emission System Leak Detected)");
            r1.setTechnicianNotes("Replaced EVAP purge valve solenoid. Performed engine oil change and multi-point chassis lube. Brake pads at 65% life.");
            r1.setLaborHours(2.5);
            r1.setLaborRate(95.0);
            r1.setServiceStatus(ServiceStatus.INVOICED);
            r1.setInvoiceId(101L);
            r1.setInvoiceNumber("INV-2026-001");
            r1.setCreatedAt(LocalDateTime.now().minusDays(14));
            r1.setCompletedAt(LocalDateTime.now().minusDays(14).plusHours(3));

            r1.addPart(new PartItem(null, "FLT-EVAP-101", "OEM EVAP Purge Solenoid", 1, 68.50, r1));
            r1.addPart(new PartItem(null, "OIL-5W30-FLT", "Motorcraft Synthetic Blend 5W-30 (6 Qt)", 1, 42.00, r1));
            r1.addPart(new PartItem(null, "FLT-FLT-09", "Heavy Duty Engine Oil Filter", 1, 14.50, r1));
            recordRepository.save(r1);

            // Record 2: Active in-progress service for Ford Transit
            ServiceRecord r2 = new ServiceRecord();
            r2.setRecordNumber("REC-90214");
            r2.setBookingReference("BK-90214");
            r2.setVehicleVin("1FTFW1E84KFA12091");
            r2.setVehiclePlate("FL-882-TR");
            r2.setVehicleModel("Ford Transit Cargo 250");
            r2.setCustomerName("Alex Mercer");
            r2.setCustomerEmail("alex@fleetcorp.com");
            r2.setCustomerPhone("+1 555-0103");
            r2.setServicePackage("ECM Sensor Calibration & 10k Tune-up");
            r2.setBayNumber("BAY-01");
            r2.setAssignedTechnicianId(2L);
            r2.setAssignedTechnicianName("Johnathan Miller");
            r2.setCurrentOdometer(34120);
            r2.setDtcCodes("P0171 (System Too Lean Bank 1)");
            r2.setTechnicianNotes("Inspecting MAF sensor and intake vacuum lines. Bay 1 diagnostic scanner linked.");
            r2.setLaborHours(1.5);
            r2.setLaborRate(110.0);
            r2.setServiceStatus(ServiceStatus.IN_PROGRESS);
            r2.setCreatedAt(LocalDateTime.now().minusHours(2));

            r2.addPart(new PartItem(null, "BOSCH-MAF-22", "Bosch Hot-Film Air Mass Meter", 1, 145.00, r2));
            recordRepository.save(r2);

            // Record 3: Scheduled service for Freightliner M2
            ServiceRecord r3 = new ServiceRecord();
            r3.setRecordNumber("REC-90215");
            r3.setBookingReference("BK-90215");
            r3.setVehicleVin("2C4RC1CG5KR239841");
            r3.setVehiclePlate("LG-409-XP");
            r3.setVehicleModel("Freightliner M2 Medium Duty");
            r3.setCustomerName("Maria Santos");
            r3.setCustomerEmail("maria@logistics.io");
            r3.setCustomerPhone("+1 555-0104");
            r3.setServicePackage("Pneumatic Air Brake Overhaul");
            r3.setBayNumber("BAY-02");
            r3.setAssignedTechnicianId(3L);
            r3.setAssignedTechnicianName("Sarah Jenkins");
            r3.setCurrentOdometer(89450);
            r3.setDtcCodes("NONE");
            r3.setTechnicianNotes("Vehicle staged at Bay 2 for heavy lift brake pad swap and drum inspection.");
            r3.setLaborHours(0.0);
            r3.setLaborRate(125.0);
            r3.setServiceStatus(ServiceStatus.SCHEDULED);
            r3.setCreatedAt(LocalDateTime.now().minusMinutes(45));
            recordRepository.save(r3);

            System.out.println(">>> PrecisionAuto Record Service: Pre-seeded 3 service records with parts & history.");
        }
    }
}
