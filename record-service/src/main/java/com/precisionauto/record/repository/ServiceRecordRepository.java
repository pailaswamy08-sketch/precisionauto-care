package com.precisionauto.record.repository;

import com.precisionauto.record.model.ServiceRecord;
import com.precisionauto.record.model.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
    List<ServiceRecord> findByVehicleVinOrderByCreatedAtDesc(String vehicleVin);
    List<ServiceRecord> findByVehiclePlateIgnoreCaseOrderByCreatedAtDesc(String vehiclePlate);
    List<ServiceRecord> findByServiceStatus(ServiceStatus serviceStatus);
    Optional<ServiceRecord> findByBookingReference(String bookingReference);
    Optional<ServiceRecord> findByRecordNumber(String recordNumber);
}
