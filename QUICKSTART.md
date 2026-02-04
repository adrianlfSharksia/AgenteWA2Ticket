# Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha el agente en 5 minutos.

## 🚀 Inicio Rápido (Local)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
# API de ejemplo (puedes usar el mock incluido)
API_ENDPOINT=http://localhost:3001/api/tickets
API_KEY=test-key

# Email (Gmail recomendado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-app
EMAIL_FROM=tu-email@gmail.com
```

### 3. Inicializar base de datos
```bash
npm run init-db
```

### 4. Agregar tu número de WhatsApp
Edita `schema.sql` o usa SQLite directamente:
```bash
sqlite3 database.db
```
```sql
INSERT INTO phone_email_mapping (phone_number, email, name) 
VALUES ('5215512345678', 'tu-email@gmail.com', 'Tu Nombre');
```

**Importante**: El número debe estar en formato internacional sin el símbolo `+`:
- México: `5215512345678` (52 = código país, 1 = móvil, resto es el número)
- USA: `14155551234`
- España: `34612345678`

### 5. Iniciar el agente
```bash
npm start
```

### 6. Escanear código QR
- Abre WhatsApp en tu teléfono
- Ve a Configuración > Dispositivos Vinculados
- Toca "Vincular un dispositivo"
- Escanea el código QR que aparece en la terminal

### 7. ¡Listo! Envía un mensaje
Envía un mensaje de WhatsApp desde el número registrado y recibe tu ticket.

---

## 🧪 Modo de Prueba (con API Mock)

Si no tienes una API REST lista, usa nuestro servidor mock incluido:

### 1. En una terminal, inicia el mock API:
```bash
node test/mock-api.js
```

### 2. En otra terminal, inicia el agente:
```bash
npm start
```

El mock API responderá con números de servicio aleatorios para testing.

---

## 📧 Configuración de Gmail

Para usar Gmail necesitas una "Contraseña de aplicación":

1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `SMTP_PASS`

---

## ✅ Verificar que todo funciona

1. **Base de datos**: Verifica que existe `database.db`
2. **WhatsApp**: Busca el mensaje "WhatsApp client is ready!"
3. **Email**: Los errores de SMTP se mostrarán en la consola
4. **API**: Los errores de API se mostrarán al recibir mensajes

---

## 🐛 Problemas Comunes

### Error: "No email found for phone number"
- Verifica que el número esté registrado en la base de datos
- El número debe estar en formato internacional sin `+`
- Verifica que coincida exactamente con el número que envía el mensaje

### Error: "SMTP authentication failed"
- Usa una contraseña de aplicación, no tu contraseña de Gmail
- Verifica que la verificación en 2 pasos esté activa
- Revisa que usuario y contraseña sean correctos

### Error: "API request failed"
- Verifica que el API_ENDPOINT sea correcto y esté accesible
- Prueba con el mock API primero
- Revisa que el API_KEY sea válido

### WhatsApp no se conecta
- Asegúrate de escanear el QR antes de que expire
- Verifica que no haya otra sesión de WhatsApp Web activa
- Elimina `.wwebjs_auth/` y vuelve a intentar

---

## 📚 Siguientes Pasos

- Lee el [README.md](README.md) completo para más detalles
- Consulta [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md) para desplegar en la nube
- Personaliza las plantillas de email en `src/email-service.js`
- Ajusta la lógica de negocio en `src/whatsapp-handler.js`

---

## 🆘 Obtener Ayuda

Si tienes problemas:
1. Revisa los logs en la consola
2. Verifica tu configuración en `.env`
3. Consulta la documentación completa
4. Abre un issue en GitHub
