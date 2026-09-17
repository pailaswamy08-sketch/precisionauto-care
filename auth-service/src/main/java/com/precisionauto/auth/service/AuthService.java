package com.precisionauto.auth.service;

import com.precisionauto.auth.dto.*;
import com.precisionauto.auth.model.Role;
import com.precisionauto.auth.model.User;
import com.precisionauto.auth.repository.UserRepository;
import com.precisionauto.auth.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getOrganization());
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("User with email " + normalizedEmail + " already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole() != null ? request.getRole() : Role.CLIENT);
        user.setPhone(request.getPhone());
        user.setOrganization(request.getOrganization() != null ? request.getOrganization() : "PrecisionAuto Customer");

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved);

        return new AuthResponse(token, saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRole(), saved.getOrganization());
    }

    public TokenValidationResponse validateToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return TokenValidationResponse.invalid("Authorization header missing or invalid format");
        }
        String token = bearerToken.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return TokenValidationResponse.invalid("Expired or invalid JWT token");
        }

        try {
            Long userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            Optional<User> userOpt = userRepository.findByEmail(email);

            String fullName = userOpt.map(User::getFullName).orElse("Unknown");
            String organization = userOpt.map(User::getOrganization).orElse("N/A");

            return new TokenValidationResponse(true, userId, email, role, fullName, organization, "Token is valid");
        } catch (Exception e) {
            return TokenValidationResponse.invalid("Failed to parse token: " + e.getMessage());
        }
    }

    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.getPhone(), u.getOrganization()))
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.getPhone(), u.getOrganization()))
                .collect(Collectors.toList());
    }

    public UserSummaryDto getUserById(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return new UserSummaryDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.getPhone(), u.getOrganization());
    }
}
