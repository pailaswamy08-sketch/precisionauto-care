package com.precisionauto.auth;

import com.precisionauto.auth.dto.AuthRequest;
import com.precisionauto.auth.dto.AuthResponse;
import com.precisionauto.auth.dto.RegisterRequest;
import com.precisionauto.auth.dto.TokenValidationResponse;
import com.precisionauto.auth.model.Role;
import com.precisionauto.auth.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Should login pre-seeded admin user and return valid JWT")
    void testAdminLogin() {
        AuthRequest request = new AuthRequest("admin@precisionauto.com", "Admin@123");
        AuthResponse response = authService.login(request);

        assertNotNull(response.getToken());
        assertEquals("admin@precisionauto.com", response.getEmail());
        assertEquals(Role.ADMIN, response.getRole());

        // Validate token
        TokenValidationResponse val = authService.validateToken("Bearer " + response.getToken());
        assertTrue(val.isValid());
        assertEquals("ADMIN", val.getRole());
        assertEquals("admin@precisionauto.com", val.getEmail());
    }

    @Test
    @DisplayName("Should register new fleet client and authenticate")
    void testClientRegistrationAndLogin() {
        String email = "newfleet_" + System.currentTimeMillis() + "@test.com";
        RegisterRequest regReq = new RegisterRequest(
                email, "Secure@123", "Fleet Manager Tim", Role.CLIENT, "+1 555-9090", "Apex Freight"
        );

        AuthResponse regResp = authService.register(regReq);
        assertNotNull(regResp.getToken());
        assertEquals(email, regResp.getEmail());
        assertEquals(Role.CLIENT, regResp.getRole());

        // Test login
        AuthRequest loginReq = new AuthRequest(email, "Secure@123");
        AuthResponse loginResp = authService.login(loginReq);
        assertNotNull(loginResp.getToken());
        assertEquals(email, loginResp.getEmail());
    }
}
