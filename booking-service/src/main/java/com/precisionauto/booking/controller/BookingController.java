package com.precisionauto.booking.controller;

import com.precisionauto.booking.dto.BayAvailabilityDto;
import com.precisionauto.booking.dto.BookingRequest;
import com.precisionauto.booking.dto.BookingResponse;
import com.precisionauto.booking.model.BookingStatus;
import com.precisionauto.booking.model.ServiceBay;
import com.precisionauto.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingResponse>> getCustomerBookings(@PathVariable Long customerId) {
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(customerId));
    }

    @GetMapping("/vin/{vin}")
    public ResponseEntity<List<BookingResponse>> getBookingsByVin(@PathVariable String vin) {
        return ResponseEntity.ok(bookingService.getBookingsByVin(vin));
    }

    @GetMapping("/bays")
    public ResponseEntity<List<ServiceBay>> getAllBays() {
        return ResponseEntity.ok(bookingService.getAllBays());
    }

    @GetMapping("/bays/availability")
    public ResponseEntity<List<BayAvailabilityDto>> getBayAvailability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getBayAvailability(date != null ? date : LocalDate.now()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        BookingStatus status = BookingStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(bookingService.updateStatus(id, status));
    }
}
