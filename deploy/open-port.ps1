. (Join-Path $PSScriptRoot 'common.ps1')
$settings = Read-Settings
$rule = 'SciStarter HTTP ' + $settings.port
if (!(Get-NetFirewallRule -DisplayName $rule -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName $rule -Direction Inbound -Action Allow -Protocol TCP -LocalPort $settings.port | Out-Null
}
Write-Host "TCP $($settings.port) is open in Windows Firewall. Check the VDS provider firewall too."
