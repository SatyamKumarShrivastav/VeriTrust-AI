# VeriTrust AI — Platform Launcher Script
# Starts both the FastAPI Backend and Vite React Frontend

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VeriTrust AI: Launching Platform Services" -ForegroundColor Green
Write-Host "  Lead Developer: Mr. S. K. Shrivastav" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend in a background process
Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory "backend" -PassThru

# 2. Start Frontend
Write-Host "`n[2/2] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd frontend && npm run dev"

Write-Host "`nServices Launched Successfully!" -ForegroundColor Green
Write-Host "Frontend Application: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API Docs:     http://localhost:8000/api/docs" -ForegroundColor White
Write-Host "`nDefault Super Admin: skshrivastav / Admin@1234" -ForegroundColor Yellow
Write-Host "Default Investigator: investigator1 / Investigator@1234" -ForegroundColor Yellow

