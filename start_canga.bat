@echo off
title Canga Vardiya Sistemi
color 0A

echo Canga Vardiya Sistemi Baslatiliyor...
echo ===================================
echo.

:: Node.js kontrolu
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Node.js yuklu degil!
    echo Node.js'i yuklemek icin https://nodejs.org adresini ziyaret edin.
    echo.
    pause
    exit /b 1
)

:: Gerekli klasorlerin varligini kontrol et
if not exist "client" (
    echo HATA: Client klasoru bulunamadi!
    echo Lutfen bu dosyayi Canga klasorunun icine koydugunuzdan emin olun.
    echo.
    pause
    exit /b 1
)

if not exist "server" (
    echo HATA: Server klasoru bulunamadi!
    echo Lutfen bu dosyayi Canga klasorunun icine koydugunuzdan emin olun.
    echo.
    pause
    exit /b 1
)

:: Paketleri yukle
echo Paketler yukleniyor...
echo ---------------------
cd server
call npm install
cd ../client
call npm install
cd ..
echo.

:: Server'i baslat (yeni pencerede)
echo Server baslatiliyor...
start "Canga Server" cmd /c "cd server && npm run dev"

:: 5 saniye bekle (server'in baslamasi icin)
timeout /t 5 /nobreak > nul

:: Client'i baslat (yeni pencerede)
echo Client baslatiliyor...
start "Canga Client" cmd /c "cd client && npm start"

echo.
echo Canga Vardiya Sistemi basariyla baslatildi!
echo Server: http://localhost:5001
echo Client: http://localhost:3000
echo.
echo Bu pencereyi kapatmak icin herhangi bir tusa basin...
echo (NOT: Sistemi kapatmak icin acilan pencereleri kapatmaniz yeterli.)
echo.
pause > nul 