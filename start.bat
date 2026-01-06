@echo off
:start
echo Starting WhatsApp Bot...
node index.js
echo Bot stopped with exit code %ERRORLEVEL%
echo Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto start
