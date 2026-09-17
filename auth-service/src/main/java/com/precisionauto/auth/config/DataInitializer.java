package com.precisionauto.auth.config;

import com.precisionauto.auth.model.Role;
import com.precisionauto.auth.model.User;
import com.precisionauto.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Admin
            userRepository.save(new User(
                    null,
                    "admin@precisionauto.com",
                    passwordEncoder.encode("Admin@123"),
                    "Robert Vance (Garage Director)",
                    Role.ADMIN,
                    "+1 555-0100",
                    "PrecisionAuto Care HQ"
            ));

            // Technicians
            userRepository.save(new User(
                    null,
                    "tech.john@precisionauto.com",
                    passwordEncoder.encode("Tech@123"),
                    "Johnathan Miller (Lead Tech)",
                    Role.TECHNICIAN,
                    "+1 555-0101",
                    "PrecisionAuto Care Workshop"
            ));

            userRepository.save(new User(
                    null,
                    "tech.sarah@precisionauto.com",
                    passwordEncoder.encode("Tech@123"),
                    "Sarah Jenkins (Senior Specialist)",
                    Role.TECHNICIAN,
                    "+1 555-0102",
                    "PrecisionAuto Care Workshop"
            ));

            // Clients
            userRepository.save(new User(
                    null,
                    "alex@fleetcorp.com",
                    passwordEncoder.encode("Client@123"),
                    "Alex Mercer (Fleet Dispatcher)",
                    Role.CLIENT,
                    "+1 555-0103",
                    "FleetCorp Express"
            ));

            userRepository.save(new User(
                    null,
                    "maria@logistics.io",
                    passwordEncoder.encode("Client@123"),
                    "Maria Santos (Operations Mgr)",
                    Role.CLIENT,
                    "+1 555-0104",
                    "Santos Logistics Group"
            ));

            System.out.println(">>> PrecisionAuto Auth Service: Pre-seeded 5 demo user accounts.");
        }
    }
}
