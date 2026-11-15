 . (Join-Path $PSScriptRoot 'common.ps1')
Push-Location $Root
try {
    $settings = Read-Settings
    New-Item -ItemType Directory -Path $Logs -Force | Out-Null
    Start-Database $settings
    Set-AppEnvironment $settings
    $pidFile = Join-Path $Logs 'backend.pid'
    if (Test-Path -LiteralPath $pidFile) {
        $existing = Get-Process -Id ([int](Get-Content -LiteralPath $pidFile)) -ErrorAction SilentlyContinue
        if ($null -ne $existing -and $existing.Path -eq $Java) { Write-Host "Already running: http://localhost:$($settings.port)"; return }
    }
    if ($settings.recommendationsEnabled) {
        $python = Join-Path $Root 'runtime\python\python.exe'
        Stop-OwnedProcess 'recommendation' $python
        $ai = Start-Process -FilePath $python -ArgumentList @('-m','uvicorn','recommendation_api:app','--host','127.0.0.1','--port','8000') -WorkingDirectory $Root -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $Logs 'recommendation.log') -RedirectStandardError (Join-Path $Logs 'recommendation-error.log')
        Set-Content -LiteralPath (Join-Path $Logs 'recommendation.pid') -Value $ai.Id
    }
    $app = Start-Process -FilePath $Java -ArgumentList @('-Xms128m','-Xmx768m','-jar','app.jar') -WorkingDirectory $Root -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $Logs 'backend.log') -RedirectStandardError (Join-Path $Logs 'backend-error.log')
    Set-Content -LiteralPath $pidFile -Value $app.Id
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if ($app.HasExited) { throw 'Application stopped. See logs/backend.log and backend-error.log.' }
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:$($settings.port)/api/health" -TimeoutSec 2
            if ($health.status -eq 'UP') { Write-Host "Ready: http://localhost:$($settings.port)"; return }
        } catch [System.Net.WebException] { }
        Start-Sleep -Seconds 1
    }
    throw 'Startup timed out. Check logs.'
} finally { Pop-Location }
