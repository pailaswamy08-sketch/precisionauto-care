package com.precisionauto.booking.repository;

import com.precisionauto.booking.model.Booking;
import com.precisionauto.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    boolean existsByBayIdAndBookingDateAndTimeSlotAndStatusNot(
            Long bayId, LocalDate bookingDate, String timeSlot, BookingStatus status);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByBayIdAndBookingDateAndStatusNot(
            Long bayId, LocalDate bookingDate, BookingStatus status);

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByVehicleVin(String vehicleVin);

    Optional<Booking> findByBookingReference(String bookingReference);
}
