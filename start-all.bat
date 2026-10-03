@echo off
title BistroByte Microservices Launcher
echo =====================================================================
echo       BistroByte Hospitality - Microservices Execution System
echo =====================================================================
echo.

set ROOT_DIR=%~dp0

where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java runtime was not found in your system PATH!
    echo Please make sure JDK 21 is installed and added to PATH.
    pause
    exit /b 1
)

echo Checking and freeing ports: 8761, 8000, 8081, 8082, 8083, 5173...
for %%P in (8761 8000 8081 8082 8083 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :%%P ^| findstr LISTENING') do (
        echo Freeing busy port %%P - stopping PID %%a
        taskkill /F /T /PID %%a >nul 2>&1
    )
)
ping 127.0.0.1 -n 3 >nul
echo All ports cleared and ready.
echo.

echo [1/5] Starting Netflix Eureka Server (Port 8761)...
start "Eureka-Server-8761" /D "%ROOT_DIR%eureka-server" cmd /k mvnw.cmd spring-boot:run
echo Waiting 12 seconds for Eureka registry initialization...
ping 127.0.0.1 -n 13 >nul

echo [2/5] Starting Auth Microservice (Port 8081)...
start "Auth-Service-8081" /D "%ROOT_DIR%auth-service" cmd /k mvnw.cmd spring-boot:run

echo [3/5] Starting Menu Microservice (Port 8082)...
start "Menu-Service-8082" /D "%ROOT_DIR%menu-service" cmd /k mvnw.cmd spring-boot:run

echo [4/5] Starting Order Microservice (Port 8083)...
start "Order-Service-8083" /D "%ROOT_DIR%order-service" cmd /k mvnw.cmd spring-boot:run

echo Waiting 10 seconds for microservices initialization...
ping 127.0.0.1 -n 11 >nul

echo [5/5] Starting API Gateway and Embedded Web UI (Port 8000)...
start "API-Gateway-8000" /D "%ROOT_DIR%api-gateway" cmd /k mvnw.cmd spring-boot:run

echo.
echo =====================================================================
echo  All 5 Microservices launched successfully!
echo.
echo  Access Web Application:          http://localhost:8000
echo  Eureka Service Registry:         http://localhost:8761
echo.
echo  Unified Swagger UI (Gateway):   http://localhost:8000/swagger-ui.html
echo  Auth Service Swagger:            http://localhost:8081/swagger-ui/index.html
echo  Menu Service Swagger:            http://localhost:8082/swagger-ui/index.html
echo  Order Service Swagger:           http://localhost:8083/swagger-ui/index.html
echo.
echo  Direct URL Test Center:          http://localhost:8000/#testCenterTab
echo =====================================================================
echo.
echo Keep this window open. Press any key to stop all services...
pause
call "%ROOT_DIR%stop-all.bat"
