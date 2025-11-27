Param(
  [string]$Port = '3003',
  [string]$Host = '127.0.0.1'
)

$env:PORT = $Port
$env:HOST = $Host

Write-Host "Starting ts-node-dev on http://$Host:$Port"
npx ts-node-dev --respawn --transpile-only --clear src/main.ts