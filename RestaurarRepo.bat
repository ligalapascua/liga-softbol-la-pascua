@echo off
setlocal EnableExtensions
cd /d "%~dp0"

cls
echo ==================================================
echo   RESTAURAR REPOSITORIO - LIGA SOFTBOL LA PASCUA
echo ==================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado o no esta en PATH.
    echo Instale Node.js 18 o superior y vuelva a ejecutar este script.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm no esta instalado o no esta en PATH.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ERROR: no se encontro package.json en %CD%
    pause
    exit /b 1
)

echo Node.js:
node --version
echo npm:
npm --version
echo.

if exist "package-lock.json" (
    echo Instalando dependencias exactas desde package-lock.json...
    call npm ci
) else (
    echo ADVERTENCIA: no existe package-lock.json.
    echo Instalando dependencias y generando un lockfile nuevo...
    call npm install
)

if errorlevel 1 (
    echo.
    echo ERROR: fallo la instalacion de dependencias.
    pause
    exit /b 1
)

echo.
echo Regenerando la compilacion web en dist\...
call npm run build:web
if errorlevel 1 (
    echo.
    echo ERROR: las dependencias se instalaron, pero fallo el build web.
    pause
    exit /b 1
)

echo.
echo Repositorio restaurado correctamente.
echo Las caches de Expo y Metro se regeneraran automaticamente
echo la proxima vez que ejecute npm run dev o un build nativo.
echo.
pause
exit /b 0
