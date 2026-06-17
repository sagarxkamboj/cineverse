# run-backend-persistent.ps1
# Script to run all Cineverse backend microservices persistently

$ErrorActionPreference = "Stop"

$RootFolder = "C:\Users\DELL\Desktop\Cineverse"
$BackendFolder = "$RootFolder\backend"
$Services = @(
    @{ Name = "Auth Service"; Port = 8081; Dir = "auth-service"; Jar = "auth-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "Movie Service"; Port = 8082; Dir = "movie-service"; Jar = "movie-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "Booking Service"; Port = 8083; Dir = "booking-service"; Jar = "booking-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "Notification Service"; Port = 8084; Dir = "notification-service"; Jar = "notification-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "API Gateway"; Port = 8080; Dir = "api-gateway"; Jar = "api-gateway-0.0.1-SNAPSHOT.jar" }
)

# 1. Stop any existing instances running on ports 8080-8084
Write-Host "Stopping any existing processes on ports 8080, 8081, 8082, 8083, 8084..." -ForegroundColor Cyan
foreach ($Service in $Services) {
    $Port = $Service.Port
    $NetstatOut = netstat -ano | Select-String ":$Port\s+"
    if ($NetstatOut) {
        foreach ($Line in $NetstatOut) {
            $Parts = $Line.ToString().Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
            if ($Parts.Length -ge 5) {
                $TargetPid = $Parts[-1]
                if ($TargetPid -match '^\d+$' -and $TargetPid -ne '0') {
                    Write-Host "Port $Port is in use by PID $TargetPid. Stopping process..." -ForegroundColor Yellow
                    Stop-Process -Id $TargetPid -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
}

# 2. Start services in the background and redirect output
Write-Host "Starting backend microservices..." -ForegroundColor Cyan
foreach ($Service in $Services) {
    $Name = $Service.Name
    $Dir = $Service.Dir
    $Jar = $Service.Jar
    $JarPath = "$BackendFolder\$Dir\target\$Jar"
    
    Write-Host "Starting $Name on port $($Service.Port)..." -ForegroundColor Green
    
    $LogFile = "$RootFolder\$($Dir)-bg.log"
    $ErrFile = "$RootFolder\$($Dir)-bg-error.log"
    if (Test-Path $LogFile) { Remove-Item $LogFile -Force }
    if (Test-Path $ErrFile) { Remove-Item $ErrFile -Force }
    
    # Launch java natively with redirection
    Start-Process java -ArgumentList "-jar `"$JarPath`"" -WorkingDirectory $BackendFolder -RedirectStandardOutput $LogFile -RedirectStandardError $ErrFile -NoNewWindow
    
    # Give it a short pause to stagger startup
    Start-Sleep -Seconds 4
}

Write-Host "All backend microservices launched. Keeping this session alive to maintain the services..." -ForegroundColor Green

# Infinite loop to prevent the task runner from exiting and cleaning up the child processes
while ($true) {
    Start-Sleep -Seconds 10
}
