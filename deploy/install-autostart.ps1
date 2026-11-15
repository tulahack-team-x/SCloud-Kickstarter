param([string]$TaskName = 'SciStarter MVP')
. (Join-Path $PSScriptRoot 'common.ps1')
$credential = Get-Credential -Message 'Windows account that owns this deployment folder'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $Root 'start.ps1') + '"') -WorkingDirectory $Root
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)
$registration = @{TaskName=$TaskName; Action=$action; Trigger=$trigger; Settings=$settings; User=$credential.UserName; Password=$credential.GetNetworkCredential().Password; RunLevel='Highest'}
Register-ScheduledTask @registration -Force | Out-Null
Write-Host "Autostart installed: $TaskName"
