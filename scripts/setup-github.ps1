<#
.SYNOPSIS
    scripts/setup-github.ps1
    Script de automatización para configurar el repositorio de GitHub con etiquetas,
    milestone e issues requeridas para el Avance de Proyecto 3 de NovaTech S.A.C.

.DESCRIPTION
    Puede ejecutarse usando:
    1) GitHub CLI ('gh') si está autenticado: gh auth login
    2) O pasando un Personal Access Token (PAT) de GitHub vía parámetro -Token

.EXAMPLE
    .\scripts\setup-github.ps1 -Repo "Sebahhs10/Novatech-HD"
    .\scripts\setup-github.ps1 -Repo "Sebahhs10/Novatech-HD" -Token "ghp_xxxxxxxxxxxx"
#>

[CmdletBinding()]
param (
    [string]$Repo = "Sebahhs10/Novatech-HD",
    [string]$Token = $env:GITHUB_TOKEN
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NOVATECH - CONFIGURACION DE INCIDENCIAS EN GITHUB" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Repositorio objetivo: $Repo" -ForegroundColor Yellow

$hasGh = $false
try {
    $null = Get-Command gh -ErrorAction Stop
    $hasGh = $true
} catch {
    $hasGh = $false
}

$useApi = $false
if (-not $hasGh -or $Token) {
    if (-not $Token) {
        Write-Host "ADVERTENCIA: 'gh' CLI no está instalada en el PATH y no se pasó el parámetro -Token." -ForegroundColor Yellow
        Write-Host "Para ejecutar automáticamente este script, proporcione un token de GitHub:" -ForegroundColor Yellow
        Write-Host "  .\scripts\setup-github.ps1 -Token 'ghp_tuTokenAqui'" -ForegroundColor White
        Write-Host "O consulte la guía manual completa en: docs/GH-SETUP.md" -ForegroundColor Green
        exit 0
    }
    $useApi = $true
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
        "User-Agent" = "NovaTech-DevOps-Setup"
    }
}

# 1. Definición de etiquetas requeridas
$labels = @(
    @{ name = "incidencia"; color = "d73a4a"; description = "Errores o fallos reportados en la plataforma" },
    @{ name = "solicitud"; color = "0075ca"; description = "Peticiones de servicio, accesos o mejoras" },
    @{ name = "prioridad-alta"; color = "b60205"; description = "Bloquea operaciones o afecta datos críticos" },
    @{ name = "prioridad-media"; color = "fbca04"; description = "Afectación parcial con alternativa temporal" },
    @{ name = "prioridad-baja"; color = "0e8a16"; description = "Mejoras menores o consultas generales" },
    @{ name = "modulo-inventario"; color = "5319e7"; description = "Relacionado al módulo de inventario y stock" },
    @{ name = "modulo-pedidos"; color = "1d76db"; description = "Relacionado a la gestión y listado de pedidos" },
    @{ name = "modulo-incidencias"; color = "e99695"; description = "Relacionado a la mesa de ayuda y soporte TI" }
)

Write-Host "`n[1/3] Creando etiquetas (labels)..." -ForegroundColor Yellow
foreach ($lbl in $labels) {
    if ($hasGh -and -not $useApi) {
        gh label create $lbl.name --color $lbl.color --description $lbl.description --repo $Repo --force 2>$null
        Write-Host "  ? Etiqueta lista: $($lbl.name)" -ForegroundColor Green
    } else {
        $body = @{ name = $lbl.name; color = $lbl.color; description = $lbl.description } | ConvertTo-Json
        try {
            $resp = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/labels" -Method Post -Headers $headers -Body $body -ContentType "application/json"
            Write-Host "  ? Creada etiqueta: $($lbl.name)" -ForegroundColor Green
        } catch {
            Write-Host "  - Etiqueta $($lbl.name) ya existe o se actualizó" -ForegroundColor Gray
        }
    }
}

# 2. Creación del Milestone
Write-Host "`n[2/3] Creando Milestone: Avance de Proyecto 3..." -ForegroundColor Yellow
$milestoneTitle = "Avance de Proyecto 3"
$milestoneDesc = "Hito para entrega del Avance de Proyecto 3: CI/CD, Mesa de Ayuda, Docker y Terraform."

if ($hasGh -and -not $useApi) {
    gh api -X POST "repos/$Repo/milestones" -f title="$milestoneTitle" -f description="$milestoneDesc" -f state="open" 2>$null
    Write-Host "  ? Milestone registrado con GitHub CLI" -ForegroundColor Green
} else {
    $msBody = @{ title = $milestoneTitle; description = $milestoneDesc; state = "open" } | ConvertTo-Json
    try {
        $msResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/milestones" -Method Post -Headers $headers -Body $msBody -ContentType "application/json"
        Write-Host "  ? Creado Milestone: $milestoneTitle" -ForegroundColor Green
    } catch {
        Write-Host "  - Milestone ya existente o registrado" -ForegroundColor Gray
    }
}

# 3. Creación de las 6 Issues reales
Write-Host "`n[3/3] Registrando las 6 Issues basadas en casos reales..." -ForegroundColor Yellow

$issues = @(
    @{
        title = "[INC-0001] Producto con stock negativo al registrar salida en Inventario"
        labels = @("incidencia", "prioridad-alta", "modulo-inventario")
        body = @"
## ?? Descripción de la Incidencia
Al intentar registrar una salida de inventario desde el módulo correspondiente, el sistema no valida existencias previas y permite generar valores negativos en stock.

## ?? Módulo Afectado
- [x] Módulo Inventario

## ?? Pasos para Reproducir
1. Abrir `inventario.html`.
2. Seleccionar un producto con existencias bajas (ej. stock: 2).
3. Registrar una salida manual por 5 unidades.
4. El stock resultante se visualiza como `-3`.

## ? Comportamiento Esperado vs. Obtenido
- **Esperado:** El sistema debe impedir la transacción y emitir alerta si la salida excede el stock actual.
- **Obtenido:** Se descuenta sin restricción dejando stock negativo.

## ?? Criterios de Aceptación
- [ ] Validación en el cliente para rechazar salida > stock actual.
- [ ] Bitácora de incidencias actualizada.
"@
    },
    @{
        title = "[SOL-0002] Habilitar credenciales y permisos para nuevo operador de almacén"
        labels = @("solicitud", "prioridad-media", "modulo-incidencias")
        body = @"
## ?? Descripción de la Solicitud
Se solicita registrar las credenciales y habilitar acceso al portal de gestión para el nuevo operador del almacén central (Carlos Ruiz).

## ?? Área / Módulo
- [x] Accesos y Seguridad
- [x] Inventario

## ? Criterios de Entrega
- [ ] Asignación de rol operador con acceso al módulo de inventario.
- [ ] Confirmación de acceso entregada al colaborador.
"@
    },
    @{
        title = "[INC-0003] Pedido no refleja actualización de estado tras despacho"
        labels = @("incidencia", "prioridad-baja", "modulo-pedidos")
        body = @"
## ?? Descripción de la Incidencia
El pedido PED-003 aparece como 'pendiente' en el listado cuando el área de despacho ya confirmó su envío a domicilio.

## ?? Módulo Afectado
- [x] Módulo Pedidos

## ? Comportamiento Esperado vs. Obtenido
- **Esperado:** Al cambiar el estado en el flujo operativo, la tabla debe persistir 'enviado'.
- **Obtenido:** Permanece en 'pendiente' hasta recargar o limpiar almacenamiento.

## ?? Criterios de Aceptación
- [ ] Estado sincronizado a 'enviado'.
- [ ] Filtro de pedidos por estado validado.
"@
    },
    @{
        title = "[INC-0004] Script incidencias.js no cargaba en el contenedor Docker (HTTP 404)"
        labels = @("incidencia", "prioridad-alta", "modulo-incidencias")
        body = @"
## ?? Descripción de la Incidencia
Al ejecutar el contenedor oficial de Nginx generado por Dockerfile, la vista `incidencias.html` arroja error 404 Not Found para `incidencias.js` debido a que faltaba su directiva `COPY`.

## ?? Módulo Afectado
- [x] Módulo Incidencias / Mesa de Ayuda
- [x] Infraestructura / Docker / CI/CD

## ?? Criterios de Aceptación
- [ ] Agregar directiva `COPY incidencias.js ./` en Dockerfile.
- [ ] Crear `.dockerignore` para excluir archivos innecesarios.
- [ ] Verificar con curl respuesta 200 en `http://localhost:8080/incidencias.js`.
"@
    },
    @{
        title = "[SOL-0005] Automatizar suite de pruebas con validación estricta y código de salida"
        labels = @("solicitud", "prioridad-media", "modulo-inventario", "modulo-pedidos")
        body = @"
## ?? Descripción de la Solicitud
Reescribir `tests/test.js` para asegurar validación sintáctica (`node --check`), existencia de archivos críticos y reglas de negocio sobre pedidos e inventario, terminando con `process.exit(1)` en caso de fallas.

## ?? Área / Módulo
- [x] Infraestructura / CI/CD
- [x] Pedidos e Inventario

## ? Criterios de Entrega
- [ ] Pruebas unitarias sin dependencias externas (Node.js nativo).
- [ ] Exit code 0 en éxito y 1 en fallo.
- [ ] Integración en el job `test` de GitHub Actions.
"@
    },
    @{
        title = "[SOL-0006] Implementar pipeline CD automático hacia AWS EC2 mediante SSH y GHCR"
        labels = @("solicitud", "prioridad-alta", "modulo-incidencias")
        body = @"
## ?? Descripción de la Solicitud
Configurar el pipeline de Entrega Continua (CD) en `.github/workflows/ci.yml` para desplegar automáticamente sobre la instancia EC2 al realizar push a `main`.

## ?? Área / Módulo
- [x] Infraestructura y DevOps

## ? Criterios de Entrega
- [ ] Job `deploy` condicionado a push en `main`.
- [ ] Documentación de variables secretas en `docs/DEPLOY.md`.
- [ ] Verificación preventiva para evitar fallos si los secretos aún no se ingresan.
"@
    }
)

foreach ($issue in $issues) {
    if ($hasGh -and -not $useApi) {
        gh issue create --title $issue.title --body $issue.body --label ($issue.labels -join ",") --repo $Repo 2>$null
        Write-Host "  ? Creada issue: $($issue.title)" -ForegroundColor Green
    } else {
        $issueBody = @{
            title = $issue.title
            body = $issue.body
            labels = $issue.labels
        } | ConvertTo-Json
        try {
            $createdIssue = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/issues" -Method Post -Headers $headers -Body $issueBody -ContentType "application/json"
            Write-Host "  ? Creada issue #$($createdIssue.number): $($issue.title)" -ForegroundColor Green
        } catch {
            Write-Host "  - Error al crear issue: $($issue.title)" -ForegroundColor Red
        }
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION COMPLETADA CON EXITO" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
