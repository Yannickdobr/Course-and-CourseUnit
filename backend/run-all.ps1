# ============================================================
# EduFlex - lance TOUT le backend dans UN SEUL terminal.
# Usage (cmd)       :  run-all
#       (PowerShell):  .\run-all.ps1
#   1) build unique (installe eduflex-common),
#   2) demarre tous les microservices dans CE terminal (logs meles),
#   3) Ctrl+C arrete tous les services d'un coup.
# La config DB est lue depuis backend\.env (rien n'est code en dur).
# ============================================================

$root = $PSScriptRoot
Set-Location $root

# --- JDK : prefere le 17 s'il est present, sinon JDK ambiant (Lombok 1.18.40 gere 17..25) ---
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
if (Test-Path $javaHome) {
    $env:JAVA_HOME = $javaHome
    $env:PATH = "$javaHome\bin;$env:PATH"
    Write-Host "JDK 17 detecte." -ForegroundColor DarkGray
} else {
    Write-Host "JDK 17 non trouve : JDK par defaut (OK avec Lombok 1.18.40+)." -ForegroundColor DarkGray
}
$env:MAVEN_OPTS = "-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"

# --- Charge les variables DB depuis .env dans l'environnement courant (herite par les services) ---
$dbKeys = @('DB_HOST','DB_PORT','DB_USERNAME','DB_PASSWORD','DB_DATABASE')
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#') { return }
        if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
            if ($dbKeys -contains $matches[1]) { Set-Item -Path "Env:$($matches[1])" -Value $matches[2] }
        }
    }
    Write-Host "Config DB chargee depuis .env." -ForegroundColor DarkGray
} else {
    Write-Host "Pas de .env : valeurs par defaut (localhost:5432)." -ForegroundColor DarkGray
}

$services = @(
    "auth-service",
    "user-service",
    "course-service",
    "media-service",
    "payment-service",
    "certificate-service"
)

# --- Build unique : seulement les services lances + eduflex-common (via -am).
#     La gateway / search / analytics / notification (non utilisees) sont ignorees. ---
$buildModules = ($services -join ",")
Write-Host "Build : mvn install -DskipTests -pl $buildModules -am ..." -ForegroundColor Cyan
mvn -q clean install -DskipTests -pl $buildModules -am
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build echoue. Corrige les erreurs ci-dessus avant de relancer." -ForegroundColor Red
    exit 1
}
Write-Host "Build OK. Demarrage des services dans ce terminal..." -ForegroundColor Green

# --- Demarre tous les services dans CE terminal (console partagee => Ctrl+C les arrete tous) ---
$procs = @()
foreach ($service in $services) {
    Write-Host ">> $service" -ForegroundColor Cyan
    $startArgs = @{
        FilePath         = "mvn.cmd"
        ArgumentList     = @("spring-boot:run", "-pl", $service)
        NoNewWindow      = $true
        PassThru         = $true
        WorkingDirectory = $root
    }
    $p = Start-Process @startArgs
    $procs += $p
    Start-Sleep -Milliseconds 800
}

Write-Host ""
Write-Host "=== $($services.Count) services demarres. Ctrl+C pour TOUT arreter. ===" -ForegroundColor Green

try {
    Wait-Process -Id ($procs | ForEach-Object { $_.Id })
} finally {
    Write-Host "Arret des services..." -ForegroundColor Yellow
    foreach ($p in $procs) {
        if ($p -and -not $p.HasExited) {
            taskkill /PID $p.Id /T /F 2>$null | Out-Null
        }
    }
    Write-Host "Services arretes." -ForegroundColor Yellow
}
