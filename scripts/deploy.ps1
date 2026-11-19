<#
.SYNOPSIS
    scripts/deploy.ps1
    Script de automatización de despliegue local contenerizado para NovaTech S.A.C.

.DESCRIPTION
    Construye la imagen Docker con versionado y tag latest, levanta el contenedor en el
    puerto configurado y ejecuta una verificación HTTP completa de todas las vistas
    y scripts estáticos (incluyendo incidencias.js) para garantizar cero errores 404.

.PARAMETER Tag
    Etiqueta de versión para la imagen (por defecto: v1.0.0).

.PARAMETER Port
    Puerto local donde se publicará el servicio (por defecto: 8080).

.EXAMPLE
    .\scripts\deploy.ps1
    .\scripts\deploy.ps1 -Tag "v1.0.0" -Port 8080
#>

[CmdletBinding()]
param (
    [string]$Tag = "v1.0.0",
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NOVATECH S.A.C. - SCRIPT DE DESPLIEGUE LOCAL DOCKER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Versión a desplegar: $Tag" -ForegroundColor Yellow
Write-Host "Puerto mapeado:      http://localhost:$Port" -ForegroundColor Yellow
Write-Host ""

# 1. Comprobación de Docker
Write-Host "[1/5] Verificando disponibilidad del motor Docker..." -ForegroundColor Yellow
try {
    $dockerVer = docker --version
    Write-Host "  ✔ Docker detectado: $dockerVer" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Docker no se encuentra instalado o no está iniciado en el sistema." -ForegroundColor Red
    Write-Host "  Consulte docs/DEPLOY.md para requisitos e instrucciones de instalación." -ForegroundColor Yellow
    exit 1
}

# 2. Limpieza de contenedor previo
Write-Host "`n[2/5] Deteniendo versiones previas del contenedor..." -ForegroundColor Yellow
try {
    docker stop novatech-web 2>$null | Out-Null
    docker rm novatech-web 2>$null | Out-Null
    Write-Host "  ✔ Contenedor anterior removido correctamente." -ForegroundColor Green
} catch {
    Write-Host "  - No había contenedores previos en ejecución." -ForegroundColor Gray
}

# 3. Construcción de imagen con doble tag (versionado + latest)
Write-Host "`n[3/5] Construyendo imagen Docker con tags: novatech:$Tag y novatech:latest..." -ForegroundColor Yellow
docker build -t "novatech:$Tag" -t "novatech:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ ERROR: Falló la construcción de la imagen Docker." -ForegroundColor Red
    exit 1
}
Write-Host "  ✔ Imagen Docker construida exitosamente." -ForegroundColor Green

# 4. Inicio del contenedor
Write-Host "`n[4/5] Iniciando contenedor 'novatech-web' en el puerto $Port..." -ForegroundColor Yellow
docker run -d -p "${Port}:80" --name novatech-web --restart always "novatech:$Tag"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ ERROR: No se pudo iniciar el contenedor." -ForegroundColor Red
    exit 1
}
Write-Host "  ✔ Contenedor iniciado y ejecutándose en segundo plano." -ForegroundColor Green

# 5. Verificación de salud HTTP
Write-Host "`n[5/5] Ejecutando verificación de disponibilidad HTTP..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$endpoints = @(
    "/",
    "/index.html",
    "/inventario.html",
    "/pedidos.html",
    "/incidencias.html",
    "/Login.html",
    "/style.css",
    "/script.js",
    "/incidencias.js"
)

$allPassed = $true
foreach ($ep in $endpoints) {
    $url = "http://localhost:$Port$ep"
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        if ($res.StatusCode -eq 200) {
            Write-Host "  ✔ [200 OK] $ep" -ForegroundColor Green
        } else {
            Write-Host "  ❌ [Status $($res.StatusCode)] $ep" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "  ❌ [FALLO] No se pudo conectar a $url" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  DESPLIEGUE LOCAL EXITOSO - TODOS LOS ENDPOINTS FUNCIONANDO" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Accede a la aplicación en: http://localhost:$Port" -ForegroundColor Yellow
} else {
    Write-Host "  ADVERTENCIA: Algunos endpoints presentaron anomalías" -ForegroundColor Red
    Write-Host "==========================================================" -ForegroundColor Cyan
    exit 1
}
