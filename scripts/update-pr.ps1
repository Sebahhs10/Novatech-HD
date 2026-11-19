[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$Token = $env:GITHUB_TOKEN,

    [Parameter(Mandatory = $false)]
    [string]$Repo = "Sebahhs10/Novatech-HD",

    [Parameter(Mandatory = $false)]
    [int]$PRNumber = 7,

    [Parameter(Mandatory = $false)]
    [string]$Reviewer = "Sebahhs10"
)

$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "❌ Error: Debes proporcionar un token de GitHub con el parametro -Token <PAT> o en `$env:GITHUB_TOKEN" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "token $Token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "NovaTech-DevOps-Script"
}

$bodyFile = Join-Path $PSScriptRoot "pr-body.md"
if (-not (Test-Path $bodyFile)) {
    Write-Host "❌ Error: No se encontro el archivo $bodyFile" -ForegroundColor Red
    exit 1
}

$prBody = [System.IO.File]::ReadAllText($bodyFile, [System.Text.Encoding]::UTF8)
$prTitle = "feat(avance3): integracion completa del modulo de incidencias, CI/CD y documentacion"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ACTUALIZANDO PULL REQUEST #$PRNumber EN $Repo" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Actualizar Titulo y Cuerpo del PR
Write-Host "`n[1/3] Actualizando titulo y descripcion de PR #$PRNumber..." -ForegroundColor Yellow
$updatePayload = @{
    title = $prTitle
    body  = $prBody
} | ConvertTo-Json -Depth 5

try {
    $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/pulls/$PRNumber" -Method Patch -Headers $headers -Body $updatePayload -ContentType "application/json; charset=utf-8"
    Write-Host "  ✅ Titulo y cuerpo actualizados correctamente." -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error al actualizar PR: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Solicitar Revisor
if (-not [string]::IsNullOrWhiteSpace($Reviewer)) {
    Write-Host "`n[2/3] Solicitando revision a @$Reviewer..." -ForegroundColor Yellow
    $revPayload = @{
        reviewers = @($Reviewer)
    } | ConvertTo-Json -Depth 5

    try {
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/pulls/$PRNumber/requested_reviewers" -Method Post -Headers $headers -Body $revPayload -ContentType "application/json; charset=utf-8"
        Write-Host "  ✅ Revisor @$Reviewer solicitado exitosamente." -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ Advertencia al solicitar revisor: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}

# 3. Asignar Milestone y Labels en Issue #7 (en GitHub PRs son Issues)
Write-Host "`n[3/3] Asignando Milestone 1 (Avance de Proyecto 3) y Etiquetas..." -ForegroundColor Yellow
$issuePayload = @{
    milestone = 1
    labels    = @("modulo-incidencias", "incidencia", "solicitud")
} | ConvertTo-Json -Depth 5

try {
    $res = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/issues/$PRNumber" -Method Patch -Headers $headers -Body $issuePayload -ContentType "application/json; charset=utf-8"
    Write-Host "  ✅ Milestone y etiquetas vinculadas a PR #$PRNumber." -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error al asignar milestone y labels: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  COMPLETADO: PR #$PRNumber actualizado en GitHub" -ForegroundColor Cyan
Write-Host "  URL: https://github.com/$Repo/pull/$PRNumber" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
