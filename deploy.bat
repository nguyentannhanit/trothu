@echo off
title Trien khai Website Tro Ly AI
cls
echo ===================================================
echo   TRIEN KHAI NHANH WEBSITE TRO LY AI LEN VERCEL
echo ===================================================
echo.
set /p msg=Nhap ghi chu (Bam Enter de dung mac dinh): 
if "%msg%"=="" set msg=Cap nhat website

echo.
echo [1/2] Dang luu Git...
git config user.email "trothu@example.com" >nul 2>&1
git config user.name "trothu" >nul 2>&1
git add .
git commit -m "%msg%" >nul 2>&1
git push origin main >nul 2>&1

echo.
echo [2/2] Dang deploy Vercel Production...
call npx vercel --prod --yes

echo.
echo ===================================================
echo   DA TRIEN KHAI THANH CONG!
echo   Website: https://trolyai-vn.vercel.app
echo ===================================================
echo.
pause
