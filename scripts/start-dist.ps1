Param(
  [string]$Port = '3004',
  [string]$BindHost = '127.0.0.1',
  [string]$DistDir = 'dist2'
)

$env:PORT = $Port
$env:HOST = $BindHost

Write-Host "Starting dist server on http://$($BindHost):$($Port) using $($DistDir)"
node "$DistDir/main.js"