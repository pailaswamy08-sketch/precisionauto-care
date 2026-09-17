@echo off
TITLE PrecisionAuto Care Platform - Service Launcher
echo ===============================================================================
echo     PrecisionAuto Care - Fleet Maintenance Platform (PS024)
echo     SOA Programming & Microservices (24SDCS03R) - Team: PS24-S54-15
echo ===============================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [1/7] Starting Eureka Discovery Server (Port 8761)...
start "PrecisionAuto [Eureka :8761]" cmd /k "cd /d %ROOT_DIR%discovery-service && mvn spring-boot:run"

echo Waiting 12 seconds for Eureka Server initialization...
timeout /t 12 /nobreak > nul

echo [2/7] Starting Auth Service (Port 8081)...
start "PrecisionAuto [Auth Service :8081]" cmd /k "cd /d %ROOT_DIR%auth-service && mvn spring-boot:run"

echo [3/7] Starting Booking Service (Port 8082)...
start "PrecisionAuto [Booking Service :8082]" cmd /k "cd /d %ROOT_DIR%booking-service && mvn spring-boot:run"

echo [4/7] Starting Record Service (Port 8083)...
start "PrecisionAuto [Record Service :8083]" cmd /k "cd /d %ROOT_DIR%record-service && mvn spring-boot:run"

echo [5/7] Starting Billing Service (Port 8084)...
start "PrecisionAuto [Billing Service :8084]" cmd /k "cd /d %ROOT_DIR%billing-service && mvn spring-boot:run"

echo Waiting 10 seconds before starting API Gateway...
timeout /t 10 /nobreak > nul

echo [6/7] Starting Spring Cloud API Gateway (Port 8080)...
start "PrecisionAuto [API Gateway :8080]" cmd /k "cd /d %ROOT_DIR%api-gateway && mvn spring-boot:run"

echo [7/7] Starting Frontend Web Portal (Port 5173)...
start "PrecisionAuto [Frontend :5173]" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

echo.
echo ===============================================================================
echo  All services have been launched!
echo.
echo  - Frontend Web Portal:    http://localhost:5173
echo  - Spring Cloud Gateway:   http://localhost:8080
echo  - Eureka Discovery UI:    http://localhost:8761
echo  - Auth Service:           http://localhost:8081
echo  - Booking Service:        http://localhost:8082
echo  - Record Service:         http://localhost:8083
echo  - Billing Service:        http://localhost:8084
echo.
echo  Pre-seeded Logins:
echo    Admin:      admin@precisionauto.com  / Admin@123
echo    Technician: tech.john@precisionauto.com / Tech@123
echo    Client:     alex@fleetcorp.com       / Client@123
echo ===============================================================================
pause
