# backup.ps1
# Bank Biometrics Database Backup Script
# Usage: .\backup.ps1

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\Backups\BankBiometrics"
$filename = "bank_biometrics_$timestamp.backup"
$filePath = Join-Path -Path $backupDir -ChildPath $filename

# Ensure backup directory exists
if (-not (Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Assume PGUSER, PGPASSWORD are set in env or use connection string
$connectionString = $env:DATABASE_URL
if (-not $connectionString) {
    # Default local fallback
    $connectionString = "postgresql://postgres:postgres@localhost:5432/bank_biometrics"
}
if ($connectionString -match "\?schema=") {
    $connectionString = ($connectionString -split "\?schema=")[0]
}

Write-Host "Starting backup of Bank Biometrics to $filePath..."
pg_dump --dbname=$connectionString -Fc -f $filePath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed successfully: $filePath" -ForegroundColor Green
    
    # Optional: Delete backups older than 30 days
    $limit = (Get-Date).AddDays(-30)
    Get-ChildItem -Path $backupDir -Filter "*.backup" | Where-Object { $_.CreationTime -lt $limit } | Remove-Item -Force
    Write-Host "Cleaned up backups older than 30 days." -ForegroundColor Cyan
} else {
    Write-Host "Backup failed!" -ForegroundColor Red
    exit 1
}
