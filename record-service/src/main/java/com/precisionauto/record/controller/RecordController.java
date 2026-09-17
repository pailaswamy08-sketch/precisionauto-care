package com.precisionauto.record.controller;

import com.precisionauto.record.dto.AddPartRequest;
import com.precisionauto.record.dto.CompleteServiceRequest;
import com.precisionauto.record.dto.CreateRecordRequest;
import com.precisionauto.record.model.ServiceRecord;
import com.precisionauto.record.model.ServiceStatus;
import com.precisionauto.record.service.RecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class RecordController {

    private final RecordService recordService;

    public RecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping("/init")
    public ResponseEntity<ServiceRecord> initializeRecord(@RequestBody CreateRecordRequest request) {
        ServiceRecord created = recordService.initializeRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ServiceRecord>> getAllRecords() {
        return ResponseEntity.ok(recordService.getAllRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRecord> getRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(recordService.getRecordById(id));
    }

    @GetMapping("/vin/{vin}")
    public ResponseEntity<List<ServiceRecord>> getRecordsByVin(@PathVariable String vin) {
        return ResponseEntity.ok(recordService.getRecordsByVin(vin));
    }

    @GetMapping("/plate/{plate}")
    public ResponseEntity<List<ServiceRecord>> getRecordsByPlate(@PathVariable String plate) {
        return ResponseEntity.ok(recordService.getRecordsByPlate(plate));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceRecord> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        ServiceStatus status = ServiceStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(recordService.updateStatus(id, status));
    }

    @PutMapping("/{id}/technician")
    public ResponseEntity<ServiceRecord> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long techId = Long.valueOf(body.get("technicianId").toString());
        String techName = body.get("technicianName").toString();
        return ResponseEntity.ok(recordService.assignTechnician(id, techId, techName));
    }

    @PostMapping("/{id}/parts")
    public ResponseEntity<ServiceRecord> addPart(
            @PathVariable Long id,
            @Valid @RequestBody AddPartRequest request) {
        return ResponseEntity.ok(recordService.addPart(id, request));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ServiceRecord> completeService(
            @PathVariable Long id,
            @RequestBody CompleteServiceRequest request) {
        return ResponseEntity.ok(recordService.completeService(id, request));
    }
}
