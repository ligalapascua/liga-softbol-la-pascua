@echo off
setlocal EnableExtensions
cd /d "%~dp0"

cls
echo ==================================================
echo    LIMPIAR REPOSITORIO - LIGA SOFTBOL LA PASCUA
echo ==================================================
echo.
echo Se eliminaran solamente archivos regenerables:
echo   - node_modules
echo   - caches de Expo, Metro y herramientas
echo   - compilaciones web y reportes de cobertura
echo   - caches y builds nativos locales, si existen
echo.
echo NO se eliminaran package.json, package-lock.json,
echo codigo fuente, configuracion, credenciales ni assets.
echo.
set /p CONFIRMAR="Escriba SI para continuar: "
if /I not "%CONFIRMAR%"=="SI" (
    echo.
    echo Operacion cancelada.
    exit /b 0
)

echo.
echo Limpiando...

call :EliminarDirectorio "node_modules"
call :EliminarDirectorio ".expo"
call :EliminarDirectorio "dist"
call :EliminarDirectorio "web-build"
call :EliminarDirectorio ".cache"
call :EliminarDirectorio ".metro-cache"
call :EliminarDirectorio "coverage"
call :EliminarDirectorio ".nyc_output"
call :EliminarDirectorio ".gradle"
call :EliminarDirectorio "android\.gradle"
call :EliminarDirectorio "android\build"
call :EliminarDirectorio "android\app\build"
call :EliminarDirectorio "ios\Pods"
call :EliminarDirectorio "ios\build"

call :EliminarArchivo "metro-cache"
call :EliminarArchivo "tsconfig.tsbuildinfo"
call :EliminarArchivo "npm-debug.log"
call :EliminarArchivo "yarn-debug.log"
call :EliminarArchivo "yarn-error.log"

for /d %%D in ("%TEMP%\metro-cache*" "%TEMP%\haste-map-*") do (
    if exist "%%~fD" (
        echo Eliminando cache temporal: %%~fD
        rd /s /q "%%~fD" 2>nul
    )
)

echo.
echo Limpieza completada.
echo Para restaurar dependencias y dist, ejecute RestaurarRepo.bat
echo.
pause
exit /b 0

:EliminarDirectorio
if exist "%~1\" (
    echo Eliminando %~1\
    rd /s /q "%~1" 2>nul
    if exist "%~1\" (
        echo ADVERTENCIA: no se pudo eliminar completamente %~1\
        echo Cierre servidores, editores o terminales que lo esten usando.
    )
) else (
    echo Omitido %~1\ ^(no existe^)
)
exit /b 0

:EliminarArchivo
if exist "%~1" (
    echo Eliminando %~1
    del /f /q "%~1" 2>nul
) else (
    echo Omitido %~1 ^(no existe^)
)
exit /b 0
