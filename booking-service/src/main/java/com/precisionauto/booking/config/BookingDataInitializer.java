package com.precisionauto.booking.config;

import com.precisionauto.booking.model.BayType;
import com.precisionauto.booking.model.Booking;
import com.precisionauto.booking.model.BookingStatus;
import com.precisionauto.booking.model.ServiceBay;
import com.precisionauto.booking.repository.BookingRepository;
import com.precisionauto.booking.repository.ServiceBayRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class BookingDataInitializer implements CommandLineRunner {

    private final ServiceBayRepository bayRepository;
    private final BookingRepository bookingRepository;

    public BookingDataInitializer(ServiceBayRepository bayRepository, BookingRepository bookingRepository) {
        this.bayRepository = bayRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void run(String... args) {
        if (bayRepository.count() == 0) {
            ServiceBay bay1 = bayRepository.save(new ServiceBay(
                    null, "BAY-01", "Bay 1 - Diagnostics & ECM Scanner", BayType.DIAGNOSTIC, true, 110.0));
            ServiceBay bay2 = bayRepository.save(new ServiceBay(
                    null, "BAY-02", "Bay 2 - Heavy Hydraulic 12-Ton Lift", BayType.HEAVY_LIFT, true, 125.0));
            ServiceBay bay3 = bayRepository.save(new ServiceBay(
                    null, "BAY-03", "Bay 3 - Fast Lube & Laser Alignment", BayType.QUICK_LUBE, true, 85.0));
            ServiceBay bay4 = bayRepository.save(new ServiceBay(
                    null, "BAY-04", "Bay 4 - Powertrain & Transmission", BayType.POWERTRAIN, true, 135.0));

            // Seed 2 initial bookings for today to show slot occupancy & collision behavior
            LocalDate today = LocalDate.now();

            Booking b1 = new Booking();
            b1.setBookingReference("BK-90214");
            b1.setBay(bay1);
            b1.setCustomerId(4L);
            b1.setCustomerName("Alex Mercer");
            b1.setCustomerEmail("alex@fleetcorp.com");
            b1.setCustomerPhone("+1 555-0103");
            b1.setVehicleVin("1FTFW1E84KFA12091");
            b1.setVehiclePlate("FL-882-TR");
            b1.setVehicleModel("Ford Transit Cargo 250");
            b1.setServicePackage("ECM Sensor Calibration & 10k Tune-up");
            b1.setBookingDate(today);
            b1.setTimeSlot("09:00 - 11:00");
            b1.setStatus(BookingStatus.IN_SERVICE);
            b1.setNotes("Intermittent check engine light on uphill haul.");
            bookingRepository.save(b1);

            Booking b2 = new Booking();
            b2.setBookingReference("BK-90215");
            b2.setBay(bay2);
            b2.setCustomerId(5L);
            b2.setCustomerName("Maria Santos");
            b2.setCustomerEmail("maria@logistics.io");
            b2.setCustomerPhone("+1 555-0104");
            b2.setVehicleVin("2C4RC1CG5KR239841");
            b2.setVehiclePlate("LG-409-XP");
            b2.setVehicleModel("Freightliner M2 Medium Duty");
            b2.setServicePackage("Pneumatic Air Brake Overhaul");
            b2.setBookingDate(today);
            b2.setTimeSlot("11:00 - 13:00");
            b2.setStatus(BookingStatus.CONFIRMED);
            b2.setNotes("Scheduled 50k brake pad & compressor check.");
            bookingRepository.save(b2);

            System.out.println(">>> PrecisionAuto Booking Service: Pre-seeded 4 service bays & sample bookings.");
        }
    }
}
