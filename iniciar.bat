@echo off
title BikeStore - Frontend
cd /d "%~dp0Frontend"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado. Descargalo en https://nodejs.org ^(version 20.19 o superior^)
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" copy ".env.example" ".env" >nul
)

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Fallo npm install
    pause
    exit /b 1
  )
)

echo Iniciando BikeStore en http://localhost:5173
start "" http://localhost:5173
call npm run dev
pause
