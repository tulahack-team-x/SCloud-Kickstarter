. (Join-Path $PSScriptRoot 'common.ps1')
Stop-OwnedProcess 'backend' $Java
Stop-OwnedProcess 'recommendation' (Join-Path $Root 'runtime\python\python.exe')
& (Join-Path $Pg 'pg_ctl.exe') -D $Data status *> $null
if ($LASTEXITCODE -eq 0) { Invoke-Native (Join-Path $Pg 'pg_ctl.exe') @('-D', $Data, '-m', 'fast', '-w', 'stop') }
Write-Host 'Stopped.'
