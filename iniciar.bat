@echo off
title BikeStore
set "ROOT=%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado. Descargalo en https://nodejs.org ^(version 20.19 o superior^)
  pause
  exit /b 1
)

if not exist "%ROOT%backend\.env" (
  copy "%ROOT%backend\.env.example" "%ROOT%backend\.env" >nul
  echo Se creo backend\.env. Configura MySQL y JWT_SECRET antes de continuar.
)
if not exist "%ROOT%frontend\.env" (
  copy "%ROOT%frontend\.env.example" "%ROOT%frontend\.env" >nul
)

pushd "%ROOT%backend"
if not exist "node_modules" (
  echo Instalando dependencias del backend...
  call npm install
  if errorlevel 1 goto install_error
)
popd

pushd "%ROOT%frontend"
if not exist "node_modules" (
  echo Instalando dependencias del frontend...
  call npm install
  if errorlevel 1 goto install_error
)
popd

echo Iniciando API en una ventana separada...
start "BikeStore API" /D "%ROOT%backend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
echo Iniciando frontend en http://localhost:5173
start "" http://localhost:5173
pushd "%ROOT%frontend"
call npm run dev
popd
pause
exit /b 0

:install_error
popd
echo [ERROR] No se pudieron instalar las dependencias.
pause
exit /b 1
