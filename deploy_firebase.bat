@echo off
title CivicGrid AI - Firebase Hosting Deployer
echo ====================================================
echo  CivicGrid AI - Deploy to Firebase Hosting
echo ====================================================
echo.
echo [1/3] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed. Fix errors and try again.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Checking Firebase authentication...
call npx firebase login:list
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Please log into Firebase first:
    call npx firebase login
)

echo.
echo [3/3] Deploying to Firebase Hosting (civicgridwiroxa)...
call npx firebase deploy --only hosting
echo.
echo ====================================================
echo  Deployment complete!
echo  Live URL: https://civicgridwiroxa.web.app
echo ====================================================
pause
