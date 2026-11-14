$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    & .\runtime\python\python.exe tools\seed_demo.py
    if ($LASTEXITCODE) { throw 'Demo seed failed.' }
} finally { Pop-Location }
