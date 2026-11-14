param([int]$Port = 8080, [int]$DatabasePort = 5433)
. (Join-Path $PSScriptRoot 'common.ps1')
Push-Location $Root
try {
    foreach ($directory in @($Logs, (Join-Path $Root 'data'))) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    if (!(Test-Path -LiteralPath (Join-Path $Root 'settings.json'))) {
        if ($Port -lt 1 -or $Port -gt 65535 -or $DatabasePort -lt 1 -or $DatabasePort -gt 65535) { throw 'Invalid port.' }
        function New-Token {
            $bytes = New-Object byte[] 32
            $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
            try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
            return [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
        }
        @{ port=$Port; databasePort=$DatabasePort; databasePassword=(New-Token); databaseAdminPassword=(New-Token); recommendationsEnabled=(Test-Path -LiteralPath 'application-local.yml') } |
            ConvertTo-Json | Set-Content -LiteralPath 'settings.json' -Encoding UTF8
    }
    $settings = Read-Settings
    $passwordFile = Join-Path $Logs 'postgres-init-password'
    if (!(Test-Path -LiteralPath (Join-Path $Data 'PG_VERSION'))) {
        [IO.File]::WriteAllText($passwordFile, $settings.databaseAdminPassword, [Text.Encoding]::ASCII)
        try {
            Invoke-Native (Join-Path $Pg 'initdb.exe') @('-D', $Data, '-U', 'scloud_admin', "--pwfile=$passwordFile", '--auth-host=scram-sha-256', '--auth-local=scram-sha-256', '-E', 'UTF8', '--locale=C')
        } finally { Remove-Item -LiteralPath $passwordFile -ErrorAction SilentlyContinue }
    }
    Start-Database $settings
    $env:DATABASE_PORT = [string]$settings.databasePort
    $env:DATABASE_PASSWORD = $settings.databasePassword
    $env:DATABASE_ADMIN_PASSWORD = $settings.databaseAdminPassword
    Invoke-Native $Java @('-cp', 'tools;tools/postgresql.jar', 'DatabaseSetup')
    Write-Host 'Setup complete. Run .\start.ps1'
} finally { Pop-Location }
