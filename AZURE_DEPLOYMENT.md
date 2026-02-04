# Guía de Despliegue en Azure

Esta guía te ayudará a desplegar el Agente de WhatsApp en Azure.

## Opciones de Despliegue

### Opción 1: Azure App Service (Recomendado)

#### Requisitos previos
- Cuenta de Azure
- Azure CLI instalado
- Código del proyecto

#### Pasos de despliegue

1. **Login en Azure CLI**
```bash
az login
```

2. **Crear un Resource Group**
```bash
az group create --name rg-whatsapp-agent --location eastus
```

3. **Crear un App Service Plan (Linux)**
```bash
az appservice plan create \
  --name plan-whatsapp-agent \
  --resource-group rg-whatsapp-agent \
  --is-linux \
  --sku B1
```

4. **Crear la Web App**
```bash
az webapp create \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --plan plan-whatsapp-agent \
  --runtime "NODE|18-lts"
```

5. **Configurar variables de entorno**
```bash
az webapp config appsettings set \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --settings \
    API_ENDPOINT="https://your-api.com/api/tickets" \
    API_KEY="your-api-key" \
    SMTP_HOST="smtp.gmail.com" \
    SMTP_PORT="587" \
    SMTP_SECURE="false" \
    SMTP_USER="your-email@gmail.com" \
    SMTP_PASS="your-app-password" \
    EMAIL_FROM="your-email@gmail.com" \
    EMAIL_FROM_NAME="Sistema de Tickets" \
    DB_PATH="/home/data/database.db" \
    NODE_ENV="production"
```

6. **Configurar comandos de inicio**
```bash
az webapp config set \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --startup-file "npm run init-db && npm start"
```

7. **Desplegar el código**

Opción A: Desde repositorio Git local
```bash
az webapp deployment source config-local-git \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent

# Obtener la URL de Git
az webapp deployment list-publishing-credentials \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --query scmUri \
  --output tsv

# Agregar remote y push
git remote add azure <URL-obtenida>
git push azure main
```

Opción B: Desde GitHub (Recomendado)
```bash
az webapp deployment source config \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --repo-url https://github.com/adrianlfSharksia/AgenteWA2Ticket \
  --branch main \
  --manual-integration
```

8. **Habilitar Always On** (Importante para mantener la conexión activa)
```bash
az webapp config set \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --always-on true
```

9. **Configurar almacenamiento persistente** (para sesión de WhatsApp)
```bash
az webapp config storage-account add \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --custom-id WhatsAppSession \
  --storage-type AzureFiles \
  --share-name whatsapp-session \
  --account-name <storage-account-name> \
  --access-key <access-key> \
  --mount-path /home/data
```

### Opción 2: Azure Container Instances

1. **Construir la imagen Docker**
```bash
docker build -t whatsapp-agent:latest .
```

2. **Crear Azure Container Registry**
```bash
az acr create \
  --name acrwhatsappagent \
  --resource-group rg-whatsapp-agent \
  --sku Basic \
  --admin-enabled true
```

3. **Push de la imagen**
```bash
az acr login --name acrwhatsappagent
docker tag whatsapp-agent:latest acrwhatsappagent.azurecr.io/whatsapp-agent:latest
docker push acrwhatsappagent.azurecr.io/whatsapp-agent:latest
```

4. **Desplegar Container Instance**
```bash
az container create \
  --name whatsapp-agent-container \
  --resource-group rg-whatsapp-agent \
  --image acrwhatsappagent.azurecr.io/whatsapp-agent:latest \
  --registry-login-server acrwhatsappagent.azurecr.io \
  --registry-username <acr-username> \
  --registry-password <acr-password> \
  --dns-name-label whatsapp-agent \
  --environment-variables \
    API_ENDPOINT="https://your-api.com/api/tickets" \
    API_KEY="your-api-key" \
    SMTP_HOST="smtp.gmail.com" \
    SMTP_PORT="587" \
    SMTP_USER="your-email@gmail.com" \
    SMTP_PASS="your-app-password"
```

### Opción 3: Azure Virtual Machine

1. **Crear VM Ubuntu**
```bash
az vm create \
  --name vm-whatsapp-agent \
  --resource-group rg-whatsapp-agent \
  --image UbuntuLTS \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys
```

2. **Conectar a la VM**
```bash
ssh azureuser@<vm-ip-address>
```

3. **Instalar Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Clonar repositorio y configurar**
```bash
git clone https://github.com/adrianlfSharksia/AgenteWA2Ticket.git
cd AgenteWA2Ticket
npm install
cp .env.example .env
nano .env  # Editar configuración
```

5. **Configurar como servicio systemd**
```bash
sudo nano /etc/systemd/system/whatsapp-agent.service
```

Contenido del archivo:
```ini
[Unit]
Description=WhatsApp Ticket Agent
After=network.target

[Service]
Type=simple
User=azureuser
WorkingDirectory=/home/azureuser/AgenteWA2Ticket
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

6. **Iniciar el servicio**
```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-agent
sudo systemctl start whatsapp-agent
sudo systemctl status whatsapp-agent
```

## Consideraciones de Producción

### Seguridad
- **No guardar credenciales en el código**: Usar siempre variables de entorno o Azure Key Vault
- **Habilitar HTTPS**: Configurar certificados SSL/TLS
- **Restringir acceso**: Configurar firewall y grupos de seguridad de red

### Almacenamiento Persistente
- **Sesión de WhatsApp**: Debe persistir entre reinicios
- **Base de datos**: Usar Azure Storage o Azure SQL Database para producción
- Configurar volúmenes montados en `/home/data` para App Service

### Monitoreo
1. **Application Insights**
```bash
az monitor app-insights component create \
  --app whatsapp-agent-insights \
  --location eastus \
  --resource-group rg-whatsapp-agent
```

2. **Configurar logs**
```bash
az webapp log config \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --application-logging filesystem \
  --level information
```

3. **Ver logs en tiempo real**
```bash
az webapp log tail \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent
```

### Escalabilidad
- **Always On**: Mantener la aplicación activa
- **Auto-scaling**: Configurar reglas de escalado automático si es necesario
- **Health checks**: Implementar endpoints de salud

### Respaldos
```bash
# Backup de la base de datos
az webapp backup create \
  --name whatsapp-ticket-agent \
  --resource-group rg-whatsapp-agent \
  --backup-name daily-backup \
  --container-url <storage-container-url>
```

## Autenticación de WhatsApp

La primera vez que se ejecuta el agente, necesitas:

1. **Acceder a los logs**
```bash
az webapp log tail --name whatsapp-ticket-agent --resource-group rg-whatsapp-agent
```

2. **Escanear el código QR**
   - El código QR aparecerá en los logs
   - Usar la opción "Dispositivos Vinculados" en WhatsApp
   - Escanear el código

3. **Verificar la sesión**
   - La sesión se guardará en `.wwebjs_auth/`
   - No se requerirá escanear nuevamente a menos que se cierre la sesión

## Troubleshooting

### Problema: El agente no se conecta a WhatsApp
- Verificar que Puppeteer tenga los recursos necesarios
- Aumentar el tamaño del App Service Plan si es necesario
- Revisar logs de Chromium/Puppeteer

### Problema: La sesión de WhatsApp se pierde
- Verificar que el almacenamiento persistente esté configurado
- Asegurarse de que `.wwebjs_auth/` se preserve entre reinicios

### Problema: Emails no se envían
- Verificar credenciales SMTP
- Revisar que el puerto SMTP no esté bloqueado
- Para Gmail, usar "Contraseña de aplicación"

### Problema: API no responde
- Verificar conectividad de red
- Revisar el endpoint y las credenciales de la API
- Verificar logs de errores

## Costos Estimados

**Azure App Service (Plan B1)**
- ~$13-15 USD/mes
- 1 núcleo, 1.75 GB RAM
- Incluye Always On

**Azure Container Instances**
- ~$30-40 USD/mes
- Basado en uso de CPU/memoria

**Azure VM (Standard_B2s)**
- ~$30-40 USD/mes
- 2 vCPUs, 4 GB RAM

## Recursos Adicionales

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [WhatsApp Web.js Documentation](https://wwebjs.dev/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)

## Soporte

Para problemas específicos de Azure, contactar al soporte de Azure.
Para problemas del agente, crear un issue en el repositorio de GitHub.
