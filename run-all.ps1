# run-all.ps1
# Script to run all Cineverse backend microservices and frontend

param (
    [switch]$Build
)

$ErrorActionPreference = "Stop"

# Define paths
$RootFolder = "C:\Users\DELL\Desktop\Cineverse"
$BackendFolder = "$RootFolder\backend"
$FrontendFolder = "$RootFolder\frontend"
$MvnPath = "$BackendFolder\tools\apache-maven-3.9.6\bin\mvn.cmd"

# Services definitions
$Services = @(
    @{ Name = "Auth Service"; Port = 8081; Dir = "auth-service"; Jar = "auth-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "Movie Service"; Port = 8082; Dir = "movie-service"; Jar = "movie-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "Booking Service"; Port = 8083; Dir = "booking-service"; Jar = "booking-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "Notification Service"; Port = 8084; Dir = "notification-service"; Jar = "notification-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "API Gateway"; Port = 8080; Dir = "api-gateway"; Jar = "api-gateway-0.0.1-SNAPSHOT.jar" }
)

# 1. Build if requested or if jars don't exist
$NeedsBuild = $Build
if (-not $NeedsBuild) {
    foreach ($Service in $Services) {
        $JarPath = "$BackendFolder\$($Service.Dir)\target\$($Service.Jar)"
        if (-not (Test-Path $JarPath)) {
            Write-Host "Jar not found for $($Service.Name) at $JarPath. Forcing a build..." -ForegroundColor Yellow
            $NeedsBuild = $true
            break
        }
    }
}

if ($NeedsBuild) {
    Write-Host "Building backend microservices... (This may take a minute)" -ForegroundColor Cyan
    Push-Location $BackendFolder
    try {
        & $MvnPath clean package -DskipTests
        Write-Host "Backend built successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to build backend!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# 2. Stop any existing instances running on those ports
Write-Host "Checking for existing services running on ports: 8080, 8081, 8082, 8083, 8084..." -ForegroundColor Cyan
foreach ($Service in $Services) {
    $Port = $Service.Port
    # Use netstat -ano to find owning process ID (avoids Get-NetTCPConnection admin privilege requirement)
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

# 3. Start services in separate windows
Write-Host "Starting backend microservices..." -ForegroundColor Cyan
foreach ($Service in $Services) {
    $Name = $Service.Name
    $Dir = $Service.Dir
    $Jar = $Service.Jar
    $JarPath = "$BackendFolder\$Dir\target\$Jar"
    
    Write-Host "Starting $Name on port $($Service.Port)..." -ForegroundColor Green
    
    # Launch in a new PowerShell window with HostTitle and custom styling
    $Cmd = "cd '$BackendFolder'; java -jar '$JarPath'"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Host.UI.RawUI.WindowTitle = '$Name'; Write-Host 'Starting $Name...' -ForegroundColor Green; $Cmd"
    
    # Give it a short pause to stagger startup
    Start-Sleep -Seconds 2
}

# 4. Start frontend
Write-Host "Starting frontend..." -ForegroundColor Cyan
$FrontendCmd = "cd '$FrontendFolder'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Host.UI.RawUI.WindowTitle = 'Cineverse Frontend'; Write-Host 'Starting Frontend dev server...' -ForegroundColor Green; $FrontendCmd"

Write-Host "`nAll Cineverse services started successfully!" -ForegroundColor Green
Write-Host "Separate console windows have been opened for each service. You can see their logs there." -ForegroundColor Green
