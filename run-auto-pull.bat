@echo off
title CivicGrid AI - Git Auto Pull Watcher
cd /d "%~dp0"
echo Starting Git Auto-Pull Watcher...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\auto_pull_watcher.ps1"
pause
