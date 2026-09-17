# PrecisionAuto Care - Service Launcher PowerShell Script
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "    PrecisionAuto Care - Fleet Maintenance Platform (PS024)" -ForegroundColor White
Write-Host "    SOA Programming & Microservices (24SDCS03R) - Team: PS24-S54-15" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

Write-Host "[1/7] Launching Eureka Discovery Server (:8761)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\discovery-service'; mvn spring-boot:run"

Write-Host "Waiting 12 seconds for Eureka registry..." -ForegroundColor Gray
Start-Sleep -Seconds 12

Write-Host "[2/7] Launching Auth Service (:8081)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\auth-service'; mvn spring-boot:run"

Write-Host "[3/7] Launching Booking Service (:8082)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\booking-service'; mvn spring-boot:run"

Write-Host "[4/7] Launching Record Service (:8083)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\record-service'; mvn spring-boot:run"

Write-Host "[5/7] Launching Billing Service (:8084)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\billing-service'; mvn spring-boot:run"

Write-Host "Waiting 10 seconds before starting API Gateway..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "[6/7] Launching API Gateway (:8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\api-gateway'; mvn spring-boot:run"

Write-Host "[7/7] Launching Frontend Web Application (:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; npm run dev"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  All services launched successfully in isolated processes!" -ForegroundColor Green
Write-Host "  - Frontend Web Portal:  http://localhost:5173" -ForegroundColor White
Write-Host "  - API Gateway:          http://localhost:8080" -ForegroundColor White
Write-Host "  - Eureka Discovery UI:  http://localhost:8761" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Cyan
