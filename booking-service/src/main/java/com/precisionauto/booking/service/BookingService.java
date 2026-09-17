package com.precisionauto.booking.service;

import com.precisionauto.booking.client.RecordClient;
import com.precisionauto.booking.dto.*;
import com.precisionauto.booking.exception.BayCollisionException;
import com.precisionauto.booking.model.Booking;
import com.precisionauto.booking.model.BookingStatus;
import com.precisionauto.booking.model.ServiceBay;
import com.precisionauto.booking.repository.BookingRepository;
import com.precisionauto.booking.repository.ServiceBayRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    public static final List<String> STANDARD_TIME_SLOTS = List.of(
            "09:00 - 11:00",
            "11:00 - 13:00",
            "14:00 - 16:00",
            "16:00 - 18:00"
    );

    private final BookingRepository bookingRepository;
    private final ServiceBayRepository serviceBayRepository;
    private final RecordClient recordClient;

    public BookingService(BookingRepository bookingRepository,
                          ServiceBayRepository serviceBayRepository,
                          RecordClient recordClient) {
        this.bookingRepository = bookingRepository;
        this.serviceBayRepository = serviceBayRepository;
        this.recordClient = recordClient;
    }

    @Transactional
    public synchronized BookingResponse createBooking(BookingRequest req) {
        ServiceBay bay = serviceBayRepository.findById(req.getBayId())
                .orElseThrow(() -> new RuntimeException("Service bay not found with ID: " + req.getBayId()));

        if (!bay.isOperational()) {
            throw new RuntimeException("Bay " + bay.getBayNumber() + " is currently offline for maintenance.");
        }

        // Validate time slot format
        if (!STANDARD_TIME_SLOTS.contains(req.getTimeSlot())) {
            throw new RuntimeException("Invalid time slot. Allowed slots: " + String.join(", ", STANDARD_TIME_SLOTS));
        }

        // Collision Check: Verify no active booking occupies this bay on this date & slot
        boolean collision = bookingRepository.existsByBayIdAndBookingDateAndTimeSlotAndStatusNot(
                bay.getId(), req.getBookingDate(), req.getTimeSlot(), BookingStatus.CANCELLED);

        if (collision) {
            String msg = String.format("Collision Detected: %s (%s) is already booked on %s for slot [%s]. Bay collision prevented.",
                    bay.getBayNumber(), bay.getBayName(), req.getBookingDate(), req.getTimeSlot());
            log.warn(msg);
            throw new BayCollisionException(msg, bay.getId(), bay.getBayNumber(), req.getBookingDate().toString(), req.getTimeSlot());
        }

        // Build Booking Entity
        Booking booking = new Booking();
        booking.setBookingReference("BK-" + System.currentTimeMillis() % 1000000);
        booking.setBay(bay);
        booking.setCustomerId(req.getCustomerId());
        booking.setCustomerName(req.getCustomerName());
        booking.setCustomerEmail(req.getCustomerEmail());
        booking.setCustomerPhone(req.getCustomerPhone());
        booking.setVehicleVin(req.getVehicleVin().trim().toUpperCase());
        booking.setVehiclePlate(req.getVehiclePlate().trim().toUpperCase());
        booking.setVehicleModel(req.getVehicleModel());
        booking.setServicePackage(req.getServicePackage());
        booking.setBookingDate(req.getBookingDate());
        booking.setTimeSlot(req.getTimeSlot());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setNotes(req.getNotes());

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = BookingResponse.fromEntity(saved);

        // Inter-service Call: Notify Record Service to create initial Service Record
        try {
            CreateServiceRecordRequest recordReq = new CreateServiceRecordRequest(
                    saved.getBookingReference(),
                    saved.getId(),
                    saved.getVehicleVin(),
                    saved.getVehiclePlate(),
                    saved.getVehicleModel(),
                    saved.getCustomerName(),
                    saved.getCustomerEmail(),
                    saved.getCustomerPhone(),
                    saved.getServicePackage(),
                    bay.getBayNumber(),
                    saved.getBookingDate().toString(),
                    saved.getTimeSlot(),
                    saved.getNotes()
            );
            Map<String, Object> recordResult = recordClient.initializeRecord(recordReq);
            if (recordResult != null && recordResult.get("id") != null) {
                Long recordId = Long.valueOf(recordResult.get("id").toString());
                response.setServiceRecordId(recordId);
                log.info("Successfully notified Record Service for booking {} -> Record ID {}", saved.getBookingReference(), recordId);
            }
        } catch (Exception e) {
            log.warn("Record Service call skipped/deferred (service might be starting up): {}", e.getMessage());
        }

        return response;
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingResponse::fromEntity)
                .sorted(Comparator.comparing(BookingResponse::getBookingDate).reversed())
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByVin(String vin) {
        return bookingRepository.findByVehicleVin(vin.toUpperCase()).stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ServiceBay> getAllBays() {
        return serviceBayRepository.findAll();
    }

    public List<BayAvailabilityDto> getBayAvailability(LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        List<ServiceBay> bays = serviceBayRepository.findAll();
        List<Booking> activeBookings = bookingRepository.findByBookingDate(queryDate).stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .toList();

        List<BayAvailabilityDto> result = new ArrayList<>();

        for (ServiceBay bay : bays) {
            BayAvailabilityDto dto = new BayAvailabilityDto();
            dto.setBayId(bay.getId());
            dto.setBayNumber(bay.getBayNumber());
            dto.setBayName(bay.getBayName());
            dto.setBayType(bay.getBayType());
            dto.setOperational(bay.isOperational());
            dto.setHourlyRate(bay.getHourlyRate());
            dto.setDate(queryDate);

            List<SlotStatusDto> slotStatuses = new ArrayList<>();
            for (String slot : STANDARD_TIME_SLOTS) {
                if (!bay.isOperational()) {
                    slotStatuses.add(new SlotStatusDto(slot, false, "UNDER_MAINTENANCE", null, null, null));
                    continue;
                }

                Optional<Booking> bookedOpt = activeBookings.stream()
                        .filter(b -> b.getBay().getId().equals(bay.getId()) && b.getTimeSlot().equals(slot))
                        .findFirst();

                if (bookedOpt.isPresent()) {
                    Booking b = bookedOpt.get();
                    slotStatuses.add(SlotStatusDto.occupied(slot, b.getBookingReference(), b.getVehiclePlate(), b.getCustomerName()));
                } else {
                    slotStatuses.add(SlotStatusDto.available(slot));
                }
            }

            dto.setSlots(slotStatuses);
            result.add(dto);
        }

        return result;
    }

    @Transactional
    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        log.info("Booking {} cancelled. Service bay slot freed.", booking.getBookingReference());
        return BookingResponse.fromEntity(updated);
    }

    @Transactional
    public BookingResponse updateStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        booking.setStatus(status);
        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }
}
