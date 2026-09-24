@echo off
title AI Assistant - Windows Desktop Agent
cd /d "%~dp0\desktop-agent"
echo ======================================================
echo   AI Assistant - Windows Desktop Agent
echo   Keep this window open while using the assistant!
echo ======================================================
node src/agent.js
pause
