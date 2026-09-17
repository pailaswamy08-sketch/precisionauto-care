@echo off
TITLE PrecisionAuto Care Platform - Fast JAR Launcher
echo ===============================================================================
echo     PrecisionAuto Care - Fleet Platform (Fast JAR Launcher)
echo     SOA Programming & Microservices (24SDCS03R) - Team: PS24-S54-15
echo ===============================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [1/7] Starting Eureka Discovery Server (:8761)...
start "PrecisionAuto [Eureka :8761]" cmd /k "java -jar discovery-service\target\discovery-service-1.0.0.jar"

echo Waiting 8 seconds for Eureka registry...
timeout /t 8 /nobreak > nul

echo [2/7] Starting Auth Service (:8081)...
start "PrecisionAuto [Auth Service :8081]" cmd /k "java -jar auth-service\target\auth-service-1.0.0.jar"

echo [3/7] Starting Booking Service (:8082)...
start "PrecisionAuto [Booking Service :8082]" cmd /k "java -jar booking-service\target\booking-service-1.0.0.jar"

echo [4/7] Starting Record Service (:8083)...
start "PrecisionAuto [Record Service :8083]" cmd /k "java -jar record-service\target\record-service-1.0.0.jar"

echo [5/7] Starting Billing Service (:8084)...
start "PrecisionAuto [Billing Service :8084]" cmd /k "java -jar billing-service\target\billing-service-1.0.0.jar"

echo Waiting 6 seconds before starting API Gateway...
timeout /t 6 /nobreak > nul

echo [6/7] Starting Spring Cloud API Gateway (:8080)...
start "PrecisionAuto [API Gateway :8080]" cmd /k "java -jar api-gateway\target\api-gateway-1.0.0.jar"

echo [7/7] Starting Frontend Web Portal (:5173)...
start "PrecisionAuto [Frontend :5173]" cmd /k "cd frontend && npm run dev"

echo.
echo ===============================================================================
echo  All microservices launched instantly via pre-compiled JARs!
echo.
echo  - Frontend Web Portal:    http://localhost:5173
echo  - Spring Cloud Gateway:   http://localhost:8080
echo  - Eureka Discovery UI:    http://localhost:8761
echo.
echo  Pre-seeded Logins:
echo    Admin:      admin@precisionauto.com  / Admin@123
echo    Technician: tech.john@precisionauto.com / Tech@123
echo    Client:     alex@fleetcorp.com       / Client@123
echo ===============================================================================
pause
