# scripts/deploy.ps1
# Script de automatización para NovaTech S.A.C.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NOVATECH - SCRIPT DE DESPLIEGUE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verificando Docker..." -ForegroundColor Yellow
docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker no esta instalado" -ForegroundColor Red
    exit 1
}
Write-Host "Docker encontrado" -ForegroundColor Green

Write-Host ""
Write-Host "Deteniendo contenedor anterior..." -ForegroundColor Yellow
docker stop novatech-web 2>$null
docker rm novatech-web 2>$null
Write-Host "Limpieza completada" -ForegroundColor Green

Write-Host ""
Write-Host "Construyendo nueva imagen Docker..." -ForegroundColor Yellow
docker build -t novatech:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la construccion" -ForegroundColor Red
    exit 1
}
Write-Host "Imagen construida" -ForegroundColor Green

Write-Host ""
Write-Host "Iniciando contenedor..." -ForegroundColor Yellow
docker run -d -p 8080:80 --name novatech-web novatech:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo la ejecucion" -ForegroundColor Red
    exit 1
}
Write-Host "Contenedor iniciado" -ForegroundColor Green

Write-Host ""
Write-Host "Verificando aplicacion..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Contenedores activos:" -ForegroundColor Cyan
docker ps

Write-Host ""
Write-Host "Logs del contenedor:" -ForegroundColor Cyan
docker logs novatech-web --tail 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abre en tu navegador: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""