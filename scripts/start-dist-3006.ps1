Param(
  [string]$BindHost = '127.0.0.1',
  [string]$DistDir = 'dist2'
)

$env:HOST = $BindHost
$env:PORT = '3006'
$env:NODE_ENV = 'development'
$env:PAGER = 'cat'

# URLs de MP basadas en FRONTEND_URL local
$env:FRONTEND_URL = 'http://127.0.0.1:4040'
$env:MP_SUCCESS_URL = $env:FRONTEND_URL + '/mp/success'
$env:MP_FAILURE_URL = $env:FRONTEND_URL + '/mp/failure'
$env:MP_PENDING_URL = $env:FRONTEND_URL + '/mp/pending'
$env:MP_NOTIFICATION_URL = '/api/transacciones/mercado-pago/webhook'

Write-Host "Starting dist server on http://$($BindHost):3006 using $($DistDir)" -ForegroundColor Green
node "$DistDir/main.js"