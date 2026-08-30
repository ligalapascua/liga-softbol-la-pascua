@echo off
setlocal
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "T=%ESC%[96m%ESC%[1m"
set "S=%ESC%[93m"
set "R=%ESC%[0m"
set "URL=" & for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "URL=%%u"
set "M1=1) https://github.com/ligalapascua/liga-softbol-la-pascua.git"
if "%URL%"=="https://github.com/ligalapascua/liga-softbol-la-pascua.git" set "M1=%ESC%[92m1) https://github.com/ligalapascua/liga-softbol-la-pascua.git ^<^<^< ACTUAL%ESC%[0m"

REM Allow direct argument: Origen.bat 1|2
if "%~1"=="1" (call :set_origin_1 & goto :eof)
if "%~1"=="2" (echo. & echo %S%Saliendo sin cambios.%R% & goto :eof)

echo %S%============================================================%R%
echo %T%Origen del repositorio - Liga Softbol La Pascua%R%
echo %S%============================================================%R%
echo.
echo %S%Origen actual:%R%
git remote -v
echo.
echo %S%============================================================%R%
echo %T%Confirmar o cambiar el origen:%R%
echo   %M1%
echo   2) Salir sin cambios
echo %S%============================================================%R%
echo.

set /p opcion="Ingresa 1 o 2: "

if "%opcion%"=="1" (
    call :set_origin_1
) else if "%opcion%"=="2" (
    echo.
    echo %S%Saliendo sin cambios.%R%
) else (
    echo.
    echo %ESC%[91mOpcion no valida. No se realizo ningun cambio.%R%
)

goto :eof

:set_origin_1
git remote set-url origin https://github.com/ligalapascua/liga-softbol-la-pascua.git
echo.
echo %ESC%[92mOrigen confirmado:%R% https://github.com/ligalapascua/liga-softbol-la-pascua.git
echo.
echo %S%Origen actual:%R%
git remote -v
goto :eof
