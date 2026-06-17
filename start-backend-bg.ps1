# start-backend-bg.ps1
# Script to run all Cineverse backend microservices in the background

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

# 2. Start services in the background using Start-Process
Write-Host "Starting backend microservices in background..." -ForegroundColor Cyan
foreach ($Service in $Services) {
    $Name = $Service.Name
    $Dir = $Service.Dir
    $Jar = $Service.Jar
    $JarPath = "$BackendFolder\$Dir\target\$Jar"
    
    Write-Host "Starting $Name on port $($Service.Port) in background..." -ForegroundColor Green
    
    # Launch as background process with output/error redirected to file logs
    $LogFile = "$RootFolder\$($Dir)-bg.log"
    if (Test-Path $LogFile) { Remove-Item $LogFile -Force }
    
    # Using Start-Process with cmd to redirect stdout/stderr to a log file
    $ArgList = "/c java -jar `"$JarPath`" > `"$LogFile`" 2>&1"
    Start-Process cmd -ArgumentList $ArgList -WorkingDirectory $BackendFolder -WindowStyle Hidden
    
    # Give it a short pause to stagger startup
    Start-Sleep -Seconds 3
}

Write-Host "All backend microservices started in background!" -ForegroundColor Green
Write-Host "Logs are being written to root folder as *-bg.log files." -ForegroundColor Green
