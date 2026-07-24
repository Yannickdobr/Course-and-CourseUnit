# PowerShell script to run EduFlex Spring Boot microservices as background jobs with env variables from .env

$services = @(
    "auth-service",
    "user-service",
    "course-service",
    "media-service",
    "payment-service",
    "certificate-service"
)

$cwd = "c:\Users\YANNICK28\Desktop\yannick\Tous mes codes du 3GI\Projet Reseau\backend"

Write-Host "Stopping any existing background jobs..." -ForegroundColor Yellow
foreach ($service in $services) {
    $job = Get-Job -Name $service -ErrorAction SilentlyContinue
    if ($job) {
        Stop-Job -Name $service
        Remove-Job -Name $service
    }
}

# Parse .env file
$envVars = @{}
$envPath = Join-Path $cwd ".env"
if (Test-Path $envPath) {
    Write-Host "Parsing environment variables from .env..." -ForegroundColor Gray
    Get-Content $envPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -like "*=*") {
            $idx = $line.IndexOf('=')
            $key = $line.Substring(0, $idx).Trim()
            $value = $line.Substring($idx + 1).Trim()
            # Strip outer quotes if present
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $envVars[$key] = $value
        }
    }
} else {
    Write-Warning ".env file not found at $envPath!"
}

Write-Host "🚀 Launching microservices as background jobs..." -ForegroundColor Green

foreach ($service in $services) {
    Write-Host "⏳ Starting $service..." -ForegroundColor Cyan
    Start-Job -Name $service -ScriptBlock {
        param($svc, $dir, $envData)
        
        # Load env vars into the background job's process
        if ($envData) {
            foreach ($key in $envData.Keys) {
                [System.Environment]::SetEnvironmentVariable($key, $envData[$key])
            }
        }
        
        # Build options
        $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
        $env:MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"
        
        cd $dir
        mvn spring-boot:run -pl $svc
    } -ArgumentList $service, $cwd, $envVars
}

Write-Host "🌟 All services started as background jobs!" -ForegroundColor Green
Write-Host "Keeping parent script alive to prevent jobs from terminating..." -ForegroundColor Yellow

# Infinite loop to keep the parent shell session active
while ($true) {
    Start-Sleep -Seconds 10
}
