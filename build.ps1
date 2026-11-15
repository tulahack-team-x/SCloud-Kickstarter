param([string]$JavaHome = $env:JAVA_HOME)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (!$JavaHome -or !(Test-Path (Join-Path $JavaHome 'bin\java.exe'))) { throw 'Set JAVA_HOME to JDK 17.' }
$env:JAVA_HOME = $JavaHome
Push-Location frontend
try {
    if (Get-Command bun -ErrorAction SilentlyContinue) {
        bun install --frozen-lockfile
        if ($LASTEXITCODE) { throw 'Dependency installation failed' }
    } elseif (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install --frozen-lockfile --ignore-scripts
        if ($LASTEXITCODE) { throw 'Dependency installation failed' }
    } else { throw 'Install Bun or pnpm to build the frontend.' }
    node node_modules/typescript/bin/tsc -b
    if ($LASTEXITCODE) { throw 'TypeScript check failed' }
    node node_modules/oxlint/bin/oxlint
    if ($LASTEXITCODE) { throw 'Frontend lint failed' }
    node node_modules/vite/bin/vite.js build
    if ($LASTEXITCODE) { throw 'Frontend build failed' }
} finally { Pop-Location }
.\gradlew.bat bootJar deploymentDriver --no-daemon
if ($LASTEXITCODE) { throw 'Backend build failed' }
Copy-Item -LiteralPath build\libs\kickstarter-0.1.0.jar -Destination deploy\app.jar -Force
& (Join-Path $JavaHome 'bin\javac.exe') --release 17 -d deploy\tools deploy\tools\DatabaseSetup.java
if ($LASTEXITCODE) { throw 'Database setup compilation failed' }
Copy-Item -LiteralPath examples -Destination deploy -Recurse -Force
Write-Host 'Built deploy/app.jar'
