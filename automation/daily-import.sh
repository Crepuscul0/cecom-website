#!/bin/bash
# Script de cron job para importación automática de RSS
# Agregar a crontab con: crontab -e
# 0 6 * * * /path/to/cecom-website/automation/daily-import.sh

cd "/home/victor/cecom-website"
echo "$(date): Iniciando importación automática de RSS" >> automation/import.log
node scripts/import-extreme-rss.js --limit=10 >> automation/import.log 2>&1
echo "$(date): Importación completada" >> automation/import.log
