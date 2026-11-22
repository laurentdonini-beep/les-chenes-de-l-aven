@echo off
rem Récupère les mises à jour du dépôt GitHub sans jamais écraser le travail local.
rem --ff-only : si des modifications locales existent, le pull est refusé proprement.
cd /d "%~dp0.."
git fetch origin
git pull --ff-only origin main
