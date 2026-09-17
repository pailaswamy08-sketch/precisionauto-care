package com.precisionauto.booking;

import com.precisionauto.booking.client.RecordClient;
import com.precisionauto.booking.dto.BookingRequest;
import com.precisionauto.booking.dto.BookingResponse;
import com.precisionauto.booking.exception.BayCollisionException;
import com.precisionauto.booking.model.BayType;
import com.precisionauto.booking.model.BookingStatus;
import com.precisionauto.booking.model.ServiceBay;
import com.precisionauto.booking.repository.BookingRepository;
import com.precisionauto.booking.repository.ServiceBayRepository;
import com.precisionauto.booking.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.annotation.DirtiesContext;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class BookingCollisionTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ServiceBayRepository bayRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @MockBean
    private RecordClient recordClient;

    private ServiceBay testBay;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        bayRepository.deleteAll();

        testBay = bayRepository.save(new ServiceBay(
                null, "TEST-BAY-1", "Collision Test Bay", BayType.DIAGNOSTIC, true, 100.0));
    }

    @Test
    @DisplayName("Should successfully book available service bay")
    void testSuccessfulBooking() {
        BookingRequest req = new BookingRequest();
        req.setBayId(testBay.getId());
        req.setCustomerName("Fleet Logistics");
        req.setCustomerEmail("fleet@test.com");
        req.setVehicleVin("TESTVIN1234567890");
        req.setVehiclePlate("TX-999-AB");
        req.setServicePackage("Oil & Filter Change");
        req.setBookingDate(LocalDate.now().plusDays(2));
        req.setTimeSlot("09:00 - 11:00");

        BookingResponse response = bookingService.createBooking(req);

        assertNotNull(response.getId());
        assertEquals("CONFIRMED", response.getStatus().name());
        assertEquals("TEST-BAY-1", response.getBayNumber());
    }

    @Test
    @DisplayName("Should eliminate collision and reject duplicate booking on same bay and slot")
    void testBookingCollisionEliminated() {
        LocalDate date = LocalDate.now().plusDays(3);
        String slot = "11:00 - 13:00";

        // First booking succeeds
        BookingRequest req1 = new BookingRequest();
        req1.setBayId(testBay.getId());
        req1.setCustomerName("Vehicle A Dispatcher");
        req1.setCustomerEmail("van_a@test.com");
        req1.setVehicleVin("VIN_VAN_A_00000000");
        req1.setVehiclePlate("VN-001");
        req1.setServicePackage("Brake Overhaul");
        req1.setBookingDate(date);
        req1.setTimeSlot(slot);

        BookingResponse first = bookingService.createBooking(req1);
        assertNotNull(first.getId());

        // Second booking attempts same bay, same date, same slot -> Collision!
        BookingRequest req2 = new BookingRequest();
        req2.setBayId(testBay.getId());
        req2.setCustomerName("Vehicle B Dispatcher");
        req2.setCustomerEmail("van_b@test.com");
        req2.setVehicleVin("VIN_VAN_B_00000000");
        req2.setVehiclePlate("VN-002");
        req2.setServicePackage("Engine Tune");
        req2.setBookingDate(date);
        req2.setTimeSlot(slot);

        BayCollisionException ex = assertThrows(BayCollisionException.class, () -> {
            bookingService.createBooking(req2);
        });

        assertTrue(ex.getMessage().contains("Collision Detected"));
        assertEquals(testBay.getId(), ex.getBayId());
        assertEquals(slot, ex.getTimeSlot());
    }

    @Test
    @DisplayName("Should allow slot to be re-booked once prior booking is cancelled")
    void testBookingAfterCancellation() {
        LocalDate date = LocalDate.now().plusDays(4);
        String slot = "14:00 - 16:00";

        BookingRequest req1 = new BookingRequest();
        req1.setBayId(testBay.getId());
        req1.setCustomerName("Customer A");
        req1.setCustomerEmail("ca@test.com");
        req1.setVehicleVin("VIN_CA_0000000000");
        req1.setVehiclePlate("CA-100");
        req1.setServicePackage("Tire Rotation");
        req1.setBookingDate(date);
        req1.setTimeSlot(slot);

        BookingResponse booked = bookingService.createBooking(req1);
        assertNotNull(booked.getId());

        // Cancel the booking
        bookingService.cancelBooking(booked.getId());

        // Now same slot can be booked by another vehicle without collision
        BookingRequest req2 = new BookingRequest();
        req2.setBayId(testBay.getId());
        req2.setCustomerName("Customer B");
        req2.setCustomerEmail("cb@test.com");
        req2.setVehicleVin("VIN_CB_0000000000");
        req2.setVehiclePlate("CB-200");
        req2.setServicePackage("Coolant Flush");
        req2.setBookingDate(date);
        req2.setTimeSlot(slot);

        BookingResponse rebooked = bookingService.createBooking(req2);
        assertNotNull(rebooked.getId());
        assertEquals(BookingStatus.CONFIRMED, rebooked.getStatus());
    }
}
