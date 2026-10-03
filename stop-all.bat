@echo off
title Stop BistroByte Services
echo =====================================================================
echo       BistroByte Hospitality - Terminating Microservices
echo =====================================================================
echo Stopping all microservices on ports 8761, 8000, 8081, 8082, 8083, 5173...

for %%P in (8761 8000 8081 8082 8083 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :%%P ^| findstr LISTENING') do (
        echo Freeing port %%P - terminating PID %%a
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

echo.
echo All microservice processes stopped successfully!
echo =====================================================================
ping 127.0.0.1 -n 3 >nul
