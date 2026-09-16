@echo off
title SOUTARAH - App Mobile (Expo)
cd /d "%~dp0soutarah-mobile"
echo ============================================================
echo   SOUTARAH GROUP - Lancement de l'app mobile
echo.
echo   - Scanner le QR code avec Expo Go (telephone sur le
echo     meme Wi-Fi que ce PC)
echo   - Ou appuyer sur "a" pour un emulateur Android
echo ============================================================
echo.
call npx expo start
pause
