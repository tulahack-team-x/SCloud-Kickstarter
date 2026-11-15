$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Root = $PSScriptRoot
$Java = Join-Path $Root 'runtime\java\bin\java.exe'
$Pg = Join-Path $Root 'runtime\postgres\bin'
$Data = Join-Path $Root 'data\postgres'
$Logs = Join-Path $Root 'logs'

function Invoke-Native([string]$Executable, [string[]]$Arguments) {
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Command failed: $Executable (exit $LASTEXITCODE)" }
}

function Read-Settings {
    $path = Join-Path $Root 'settings.json'
    if (!(Test-Path -LiteralPath $path)) { throw 'Run setup.ps1 first.' }
    return Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
}

function Set-AppEnvironment($Settings) {
    $env:DATABASE_URL = "jdbc:postgresql://127.0.0.1:$($Settings.databasePort)/kickstarter"
    $env:DATABASE_USERNAME = 'kickstarter'
    $env:DATABASE_PASSWORD = $Settings.databasePassword
    $env:PORT = [string]$Settings.port
    $env:SERVER_ADDRESS = '0.0.0.0'
    $env:DEMO_PAYMENTS = 'true'
    $env:FILES_DIRECTORY = Join-Path $Root 'data\uploads'
    $env:MICROSERVICE_CONFIG = Join-Path $Root 'application-local.yml'
}

function Start-Database($Settings) {
    & (Join-Path $Pg 'pg_ctl.exe') -D $Data status *> $null
    if ($LASTEXITCODE -eq 0) { return }
    Invoke-Native (Join-Path $Pg 'pg_ctl.exe') @('-D', $Data, '-l', (Join-Path $Logs 'postgres.log'), '-o', "-p $($Settings.databasePort) -h 127.0.0.1", '-w', 'start')
}

function Stop-OwnedProcess([string]$Name, [string]$Executable) {
    $pidFile = Join-Path $Logs "$Name.pid"
    if (!(Test-Path -LiteralPath $pidFile)) { return }
    $process = Get-Process -Id ([int](Get-Content -LiteralPath $pidFile)) -ErrorAction SilentlyContinue
    if ($null -ne $process -and [string]::Equals($process.Path, $Executable, [StringComparison]::OrdinalIgnoreCase)) {
        Stop-Process -Id $process.Id
    }
    Remove-Item -LiteralPath $pidFile
}
