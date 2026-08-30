@echo off
setlocal
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "T=%ESC%[96m%ESC%[1m"
set "S=%ESC%[93m"
set "R=%ESC%[0m"
set "URL=" & for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "URL=%%u"
set "M1=1) https://github.com/ingalfsan/gastos.git"
set "M2=2) https://github.com/tecnimedi/gastos.git"
if "%URL%"=="https://github.com/ingalfsan/gastos.git" set "M1=%ESC%[92m1) https://github.com/ingalfsan/gastos.git ^<^<^< ACTUAL%ESC%[0m"
if "%URL%"=="https://github.com/tecnimedi/gastos.git" set "M2=%ESC%[92m2) https://github.com/tecnimedi/gastos.git ^<^<^< ACTUAL%ESC%[0m"

REM Allow direct argument: Origen.bat 1|2|3
if "%~1"=="1" (call :set_origin_1 & goto :eof)
if "%~1"=="2" (call :set_origin_2 & goto :eof)
if "%~1"=="3" (echo. & echo Saliendo sin cambios. & goto :eof)

echo %S%============================================================%R%
echo %T%Cambiar origen del repositorio%R%
echo %S%============================================================%R%
echo.
echo %S%Origen actual:%R%
git remote -v
echo.
echo %S%============================================================%R%
echo %T%Selecciona el nuevo origen:%R%
echo   %M1%
echo   %M2%
echo   3) Salir sin cambios
echo %S%============================================================%R%
echo.

set /p opcion="Ingresa 1, 2 o 3: "

if "%opcion%"=="1" (
    call :set_origin_1
) else if "%opcion%"=="2" (
    call :set_origin_2
) else if "%opcion%"=="3" (
    echo.
    echo %S%Saliendo sin cambios.%R%
) else (
    echo.
    echo %ESC%[91mOpcion no valida. No se realizo ningun cambio.%R%
)

goto :eof

:set_origin_1
git remote set-url origin https://github.com/ingalfsan/gastos.git
echo.
echo %ESC%[92mOrigen cambiado a:%R% https://github.com/ingalfsan/gastos.git
echo.
echo %S%Nuevo origen:%R%
git remote -v
goto :eof

:set_origin_2
git remote set-url origin https://github.com/tecnimedi/gastos.git
echo.
echo %ESC%[92mOrigen cambiado a:%R% https://github.com/tecnimedi/gastos.git
echo.
echo %S%Nuevo origen:%R%
git remote -v
goto :eof
