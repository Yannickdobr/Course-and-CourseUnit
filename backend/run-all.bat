@echo off
REM Lance tout le backend EduFlex dans CE terminal (via run-all.ps1).
REM Usage depuis cmd :  run-all
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-all.ps1"
