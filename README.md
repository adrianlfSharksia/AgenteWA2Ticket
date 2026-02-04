# AgenteWA2Ticket

Agente de WhatsApp que recibe mensajes, crea tickets mediante una API REST y envía confirmaciones por correo electrónico.

## 📋 Características

- **Recepción de mensajes de WhatsApp**: Escucha mensajes entrantes en tiempo real
- **Creación automática de tickets**: Integración con API REST para crear tickets
- **Notificación por email**: Envía confirmación con número de servicio
- **Base de datos SQLite**: Mapeo de números telefónicos a correos electrónicos
- **Compatible con Azure**: Listo para despliegue en Azure

## 🚀 Instalación

### Requisitos previos

- Node.js 16.x o superior
- npm o yarn
- Cuenta de WhatsApp Business o WhatsApp personal

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/adrianlfSharksia/AgenteWA2Ticket.git
cd AgenteWA2Ticket
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copiar el archivo de ejemplo y configurar:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# API Configuration
API_ENDPOINT=https://your-api.com/api/tickets
API_KEY=your-api-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email sender info
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Sistema de Tickets

# Database
DB_PATH=./database.db
```

4. **Inicializar la base de datos**
```bash
npm run init-db
```

5. **Configurar mapeo de teléfonos a emails**

Editar el archivo `schema.sql` o insertar registros directamente en la base de datos:

```sql
INSERT INTO phone_email_mapping (phone_number, email, name) VALUES 
    ('5215512345678', 'usuario@example.com', 'Juan Pérez');
```

**Nota**: El número de teléfono debe estar en formato internacional sin el símbolo `+` (ejemplo: `5215512345678` para México).

## 🎯 Uso

### Iniciar el agente

```bash
npm start
```

La primera vez que ejecutes el agente, se mostrará un código QR en la terminal. Escanéalo con WhatsApp para autenticar.

### Flujo de operación

1. Un usuario envía un mensaje de WhatsApp
2. El agente recibe el mensaje y busca el email asociado al número
3. Se crea un ticket mediante la API REST configurada
4. La API devuelve un número de servicio
5. Se envía un correo de confirmación al email asociado
6. Se responde al usuario en WhatsApp con el número de ticket

## 📁 Estructura del proyecto

```
AgenteWA2Ticket/
├── src/
│   ├── index.js              # Punto de entrada principal
│   ├── whatsapp-handler.js   # Manejo de WhatsApp
│   ├── database.js           # Funciones de base de datos
│   ├── api-client.js         # Cliente para API REST
│   ├── email-service.js      # Servicio de envío de emails
│   └── init-db.js            # Inicialización de base de datos
├── schema.sql                # Schema de base de datos
├── package.json              # Dependencias del proyecto
├── .env.example              # Ejemplo de configuración
├── .gitignore                # Archivos ignorados por git
└── README.md                 # Este archivo
```

## 🔧 Configuración

### API REST

La API debe aceptar peticiones POST con el siguiente formato:

```json
{
  "phone": "5215512345678",
  "message": "Mensaje del usuario",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "source": "whatsapp",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

Y debe responder con un objeto que contenga el número de servicio:

```json
{
  "serviceNumber": "12345",
  "status": "created",
  ...
}
```

El campo con el número de servicio puede llamarse: `serviceNumber`, `ticketId`, `id`, o `number`.

### Configuración de Email

Para Gmail, necesitas:
1. Habilitar "Verificación en 2 pasos"
2. Generar una "Contraseña de aplicación"
3. Usar esa contraseña en `SMTP_PASS`

Para otros proveedores SMTP, ajusta `SMTP_HOST`, `SMTP_PORT` y `SMTP_SECURE`.

### Base de datos

SQLite se usa para almacenar el mapeo entre números telefónicos y emails:

```sql
CREATE TABLE phone_email_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## ☁️ Despliegue en Azure

### Opción 1: Azure App Service

1. Crear un App Service con runtime de Node.js
2. Configurar variables de entorno en Azure Portal
3. Desplegar código mediante:
   - Git deployment
   - GitHub Actions
   - Azure CLI

### Opción 2: Azure Container Instances

1. Crear un Dockerfile:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run init-db
CMD ["npm", "start"]
```

2. Construir y desplegar el contenedor

### Opción 3: Azure Functions

Para ejecutar como Azure Function, necesitarás adaptar el código a un trigger personalizado o timer.

**Nota importante**: WhatsApp Web requiere una sesión persistente, por lo que se recomienda usar Azure App Service o una VM para mantener la conexión activa.

## 🔍 Monitoreo y logs

El agente genera logs detallados en la consola:

- Mensajes recibidos
- Tickets creados
- Emails enviados
- Errores y excepciones

Para producción, considera integrar con Azure Application Insights o similares.

## 🛠️ Desarrollo

### Agregar nuevas funcionalidades

1. Editar los archivos en `/src`
2. Probar localmente
3. Actualizar documentación

### Scripts disponibles

- `npm start`: Inicia el agente
- `npm run init-db`: Inicializa la base de datos

## ⚠️ Consideraciones

- **Sesión de WhatsApp**: La sesión se guarda localmente en `.wwebjs_auth/`. No eliminar esta carpeta.
- **Límites de WhatsApp**: Respeta los límites de uso de WhatsApp para evitar bloqueos
- **Seguridad**: No compartir archivos `.env` o credenciales
- **Base de datos**: Hacer backups regulares de `database.db`

## 📝 Licencia

Apache License 2.0

## 🤝 Soporte

Para reportar problemas o sugerir mejoras, crea un issue en el repositorio.

## 📧 Contacto

Para más información, contacta al administrador del sistema.
