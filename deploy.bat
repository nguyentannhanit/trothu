@echo off
chcp 65001 >nul
title Trien khai nhanh website Tro Ly AI len Vercel

echo ===================================================
echo   TRIEN KHAI NHANH WEBSITE TRO LY AI LEN VERCEL
echo ===================================================
echo.

set /p msg="Nhap ghi chu thay doi (Bam Enter de dung mac dinh): "
if "%msg%"=="" set msg=Cap nhat website %date% %time%

echo.
echo [1/3] Dang luu cac thay doi moi...
git config user.email "trothu@example.com" >nul 2>&1
git config user.name "trothu" >nul 2>&1
git add .

echo.
echo [2/3] Dang tao diem luu (commit)...
git commit -m "%msg%"

echo.
echo [3/3] Dang day ma nguon len GitHub va Vercel...
git push origin main

echo.
echo ===================================================
echo   CHUC MUNG! DA DAY MA NGUON THANH CONG!
echo   Vercel dang tu dong Build lai tren trang:
echo   https://trolyai-vn.vercel.app
echo ===================================================
echo.
pause
