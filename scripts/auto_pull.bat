@echo off
title CivicGridAi Git Auto-Pull Watcher
powershell -ExecutionPolicy Bypass -File "%~dp0auto_pull.ps1"
pause
