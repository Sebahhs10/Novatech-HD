[CmdletBinding()]
param (
    [string]$Repo = "Sebahhs10/Novatech-HD",
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Assignee = "danielgc12",
    [int]$Milestone = 1
)

$ErrorActionPreference = "Stop"

if (-not $Token -or $Token.Length -lt 20) {
    Write-Host "❌ ERROR: Debes proporcionar tu token de GitHub con el parámetro -Token 'ghp_...'" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent" = "NovaTech-Assign"
}

Write-Host "Asociando Milestone $Milestone y asignando a $Assignee en issues #8 a #13..." -ForegroundColor Cyan

foreach ($num in 8..13) {
    $body = @{
        milestone = $Milestone
        assignees = @($Assignee)
    } | ConvertTo-Json

    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $resp = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/issues/$num" -Method Patch -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        Write-Host "  ✔ Issue #$num vinculada a Milestone y asignada a $Assignee" -ForegroundColor Green
    } catch {
        $errDetail = $_.ErrorDetails.Message
        if (-not $errDetail) { $errDetail = $_.Exception.Message }
        Write-Host "  ❌ Error en issue #$num: $errDetail" -ForegroundColor Red
    }
}

Write-Host "`nVerificación completada." -ForegroundColor Green
