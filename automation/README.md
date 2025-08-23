# Automatización del Blog RSS

## Configuración Completada

### 1. Cron Job Diario
- **Horario**: Todos los días a las 6:00 AM
- **Comando**: `node scripts/import-extreme-rss.js --limit=10`
- **Script**: `automation/daily-import.sh`
- **Log**: `automation/import.log`

#### Para activar el cron job:
```bash
# Editar crontab
crontab -e

# Agregar esta línea:
0 6 * * * /home/victor/cecom-website/automation/daily-import.sh
```

### 2. Webhook para Importación Manual
- **Endpoint**: `/api/webhook/rss-import`
- **Método**: POST
- **Secret**: `cecom-rss-webhook-kte7rj`

#### Ejemplo de uso:
```bash
curl -X POST http://localhost:3000/api/webhook/rss-import \
  -H "Content-Type: application/json" \
  -d '{"secret": "cecom-rss-webhook-kte7rj", "limit": 5}'
```

### 3. Monitoreo
- Logs se guardan en `automation/import.log`
- Configuración en `automation/`
- Estado del webhook: GET `/api/webhook/rss-import`

### 4. Mantenimiento
- Revisar logs regularmente
- Ajustar límite de importación según necesidad
- Rotar logs mensualmente

## Próximos Pasos
1. Configurar cron job en el servidor de producción
2. Configurar alertas por email en caso de errores
3. Implementar dashboard de monitoreo
4. Configurar backup automático de contenido importado
