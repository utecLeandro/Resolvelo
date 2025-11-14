<#
 ASCII-only stop script for ReSolVelo
 Run from project root: .\stop-all.ps1
#>

Write-Host 'Stopping ReSolVelo...' -ForegroundColor Red
Write-Host '=================================' -ForegroundColor Red

# Stop Docker services
Write-Host 'Stopping Docker services...' -ForegroundColor Yellow
try {
  docker-compose down
  Write-Host 'Docker services stopped' -ForegroundColor Green
} catch {
  Write-Host ('Docker stop error (maybe not running): {0}' -f $_.Exception.Message) -ForegroundColor Yellow
}

# Kill by ports (backend/frontend common and alternates)
$ports = @(3006, 3004, 3011, 3010, 3000, 5173, 5555)
foreach ($port in $ports) {
  Write-Host ('Scanning port {0}...' -f $port) -ForegroundColor Yellow
  try {
    $lines = netstat -ano -p TCP | Select-String (':{0}' -f $port) | ForEach-Object { $_.Line }
    if ($lines -and $lines.Count -gt 0) {
      $pids = @()
      foreach ($line in $lines) {
        $parts = $line -split '\s+'
        if ($parts -and $parts.Length -gt 0) {
          $pidStr = $parts[$parts.Length - 1]
          if ($pidStr -match '^\d+$') { $pids += [int]$pidStr }
        }
      }
      $uniqPids = $pids | Sort-Object -Unique
      foreach ($myPid in $uniqPids) {
        try {
          $proc = Get-Process -Id $myPid -ErrorAction SilentlyContinue
          if ($proc) {
            Write-Host ('Killing process {0} (PID: {1})' -f $proc.ProcessName, $myPid) -ForegroundColor Red
            Stop-Process -Id $myPid -Force -ErrorAction SilentlyContinue
          } else {
            Write-Host ('taskkill PID {0} for port {1}' -f $myPid, $port) -ForegroundColor Red
            taskkill /PID $myPid /F | Out-Null
          }
        } catch {}
      }
    } else {
      Write-Host ('No connections on port {0}' -f $port) -ForegroundColor Yellow
    }
  } catch {
    Write-Host ('Error scanning port {0}: {1}' -f $port, $_.Exception.Message) -ForegroundColor Yellow
  }
}

# Kill all node processes (cleanup CLOSE_WAIT)
Write-Host 'Scanning Node.js processes...' -ForegroundColor Yellow
try {
  $nodeProcesses = Get-Process -Name 'node' -ErrorAction SilentlyContinue
  foreach ($process in $nodeProcesses) {
    Write-Host ('Killing Node.js process PID: {0}' -f $process.Id) -ForegroundColor Red
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
  }
} catch {
  Write-Host 'No Node.js processes found' -ForegroundColor Yellow
}

# Clean logs
if (Test-Path 'logs') {
  Write-Host 'Cleaning log files...' -ForegroundColor Yellow
  Remove-Item 'logs\*.pid' -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host 'All services have been stopped' -ForegroundColor Green
Write-Host 'To start again, run: .\start-all.ps1' -ForegroundColor Cyan