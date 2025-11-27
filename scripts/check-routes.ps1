Param(
  [string]$Url = 'http://127.0.0.1:3006/api/__routes'
)

try {
  $content = (Invoke-WebRequest -Uri $Url -UseBasicParsing).Content
  Write-Host "__routes length: $($content.Length)"
  if ($content -match 'transacciones') {
    Write-Host 'Found transacciones in routes'
  } else {
    Write-Host 'No transacciones routes found'
  }
} catch {
  Write-Host "ERR: $($_.Exception.Message)"
}