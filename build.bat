@echo off
cls
set EAS_NO_VCS=1

:: Verificar si existe .easignore
if not exist ".easignore" (
    echo ADVERTENCIA: No se encuentra el archivo .easignore
    echo Este archivo es importante para optimizar el tamaño del build
    echo Creando .easignore con configuración por defecto...
    copy nul .easignore
    echo # Directorios de desarrollo >> .easignore
    echo node_modules/ >> .easignore
    echo .expo/ >> .easignore
    echo .vscode/ >> .easignore
    echo __tests__/ >> .easignore
    echo coverage/ >> .easignore
    echo .git/ >> .easignore
    echo # Archivos de desarrollo >> .easignore
    echo *.log >> .easignore
    echo .env >> .easignore
    echo .env.* >> .easignore
    echo # Assets sin optimizar >> .easignore
    echo assets/raw/ >> .easignore
    echo *.psd >> .easignore
    echo *.ai >> .easignore
    echo # Archivos temporales >> .easignore
    echo *.tmp >> .easignore
    echo .cache/ >> .easignore
    echo.
    echo .easignore creado exitosamente!
    echo.
    pause
)

:menu
echo.
echo ================================================
echo    MENU DE CONSTRUCCION Y DESPLIEGUE MOVIL      
echo ================================================
echo.
echo ANDROID:
echo 1. Generar APK para pruebas (Android)
echo 2. Generar AAB para Play Store (Android)
echo 3. Generar APK sin keystore (desarrollo)
echo.
echo iOS / iPHONE:
echo 4. Generar build para simulador iOS
echo 5. Generar IPA para pruebas (iOS Ad-Hoc)
echo 6. Generar IPA para App Store (iOS)
echo 7. Build de desarrollo iOS
echo.
echo OTRAS OPCIONES:
echo 8. Iniciar version Web
echo 9. Limpiar cache y node_modules
echo 10. Ver estado de builds en EAS
echo 11. Diagnosticar problemas de build
echo 12. Configurar credenciales EAS
echo 0. Salir
echo.
set /p opcion="Seleccione una opcion (0-12): "

if "%opcion%"=="1" goto android_apk
if "%opcion%"=="2" goto android_aab
if "%opcion%"=="3" goto android_dev
if "%opcion%"=="4" goto ios_simulator
if "%opcion%"=="5" goto ios_adhoc
if "%opcion%"=="6" goto ios_appstore
if "%opcion%"=="7" goto ios_development
if "%opcion%"=="8" goto web
if "%opcion%"=="9" goto clean
if "%opcion%"=="10" goto build_status
if "%opcion%"=="11" goto diagnose
if "%opcion%"=="12" goto setup_credentials
if "%opcion%"=="0" goto end

echo Opcion invalida. Presione cualquier tecla para continuar...
pause >nul
goto menu

:android_apk
cls
echo.
echo ========================================
echo    GENERANDO APK PARA PRUEBAS...
echo ========================================
echo.
echo Generando APK para Android con perfil preview...
call npx eas-cli build --platform android --profile preview --clear-cache --non-interactive
echo.
echo Build completado! Revisa el link que aparece arriba.
pause
goto menu

:android_aab
cls
echo.
echo ========================================
echo    GENERANDO AAB PARA PLAY STORE...
echo ========================================
echo.
echo Generando AAB para Android con perfil production...
call npx eas-cli build --platform android --profile production --clear-cache --non-interactive
echo.
echo Build completado! Revisa el link que aparece arriba.
pause
goto menu

:ios_simulator
cls
echo.
echo ========================================
echo    GENERANDO BUILD PARA SIMULADOR iOS...
echo ========================================
echo.
echo NOTA: Este build solo funciona en simuladores iOS
echo Generando build para simulador iOS...
call npx eas-cli build --platform ios --profile preview --clear-cache --non-interactive
echo.
echo Build completado! Puedes instalarlo en el simulador iOS.
pause
goto menu

:ios_adhoc
cls
echo.
echo ========================================
echo    GENERANDO IPA PARA PRUEBAS (Ad-Hoc)...
echo ========================================
echo.
echo NOTA: Necesitas tener configurado un Apple Developer Account
echo y los dispositivos registrados para distribución Ad-Hoc
echo.
echo Generando IPA para distribución interna (Ad-Hoc)...
call npx eas-cli build --platform ios --profile adhoc --clear-cache --non-interactive
echo.
echo Build completado! Puedes distribuir este IPA a dispositivos registrados.
pause
goto menu

:ios_appstore
cls
echo.
echo ========================================
echo    GENERANDO IPA PARA APP STORE...
echo ========================================
echo.
echo ADVERTENCIA: Este build es para subir a la App Store
echo Asegurate de haber configurado correctamente:
echo - Apple Developer Account
echo - App Store Connect
echo - Certificados y perfiles de aprovisionamiento
echo.
echo Generando IPA para App Store...
call npx eas-cli build --platform ios --profile production --clear-cache --non-interactive
echo.
echo Build completado! Usa este IPA para subir a App Store Connect.
pause
goto menu

:ios_development
cls
echo.
echo ========================================
echo    GENERANDO BUILD DE DESARROLLO iOS...
echo ========================================
echo.
echo Generando build de desarrollo para iOS...
call npx eas-cli build --platform ios --profile development --clear-cache --non-interactive
echo.
echo Build completado! Este build incluye herramientas de desarrollo.
pause
goto menu

:web
cls
echo.
echo ========================================
echo    INICIANDO VERSION WEB...
echo ========================================
echo.
call npx expo start --web
pause
goto menu

:clean
cls
echo.
echo ========================================
echo    LIMPIANDO PROYECTO...
echo ========================================
echo.
echo Eliminando node_modules...
if exist node_modules rd /s /q node_modules
echo Eliminando cache...
if exist .expo rd /s /q .expo
if exist .gradle rd /s /q .gradle
if exist yarn.lock del /f /q yarn.lock
if exist package-lock.json del /f /q package-lock.json
echo Reinstalando dependencias...
call npm install
echo.
echo Limpieza completada!
pause
goto menu

:android_dev
cls
echo.
echo ========================================
echo    GENERANDO APK DE DESARROLLO...
echo ========================================
echo.
echo Generando APK de desarrollo sin keystore...
call npx eas-cli build --platform android --profile development --clear-cache --non-interactive
echo.
echo Build completado! Revisa el link que aparece arriba.
pause
goto menu

:build_status
cls
echo.
echo ========================================
echo    ESTADO DE BUILDS EN EAS...
echo ========================================
echo.
echo Consultando estado de builds en EAS CLI...
call npx eas-cli build:list
echo.
pause
goto menu

:diagnose
cls
echo.
echo ========================================
echo    EJECUTANDO DIAGNOSTICO...
echo ========================================
echo.
call diagnose-build.bat
goto menu

:setup_credentials
cls
echo.
echo ========================================
echo    CONFIGURACION DE CREDENCIALES...
echo ========================================
echo.
call setup-credentials.bat
goto menu

:end
echo.
echo Gracias por usar el sistema de build de RefillCenter!
echo.
