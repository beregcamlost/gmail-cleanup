<p align="center">
  <a href="README.md">English</a> · <a href="README.es.md">Español</a>
</p>

<p align="center">
  <img src="https://img.icons8.com/color/96/gmail--v1.png" alt="Gmail Cleanup Logo" width="96"/>
</p>

<h1 align="center">Gmail Cleanup</h1>

<p align="center">
  <strong>Limpieza automatizada de bandeja de entrada y cancelación masiva de suscripciones en Gmail</strong>
</p>

<p align="center">
  <a href="https://script.google.com"><img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Apps Script"/></a>
  <a href="https://developers.google.com/gmail/api"><img src="https://img.shields.io/badge/Gmail%20API-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail API"/></a>
  <img src="https://img.shields.io/badge/licencia-MIT-green?style=for-the-badge" alt="Licencia MIT"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/sin%20dependencias-success?style=flat-square" alt="Sin Dependencias"/>
  <img src="https://img.shields.io/badge/corre%20en-Google%20Cloud-blue?style=flat-square" alt="Google Cloud"/>
  <img src="https://img.shields.io/badge/costo-gratis-brightgreen?style=flat-square" alt="Gratis"/>
</p>

---

## Qué Hace

Un script de Google Apps Script que limpia automáticamente tu bandeja de Gmail eliminando promociones, newsletters y correos de marketing antiguos — y **te desuscribe** de ellos antes de borrarlos.

### Características

| Característica | Descripción |
|----------------|-------------|
| **Detección Inteligente** | Detecta la categoría Promociones de Gmail, patrones de newsletters y remitentes de marketing |
| **Auto-Desuscripción** | Analiza los headers `List-Unsubscribe` y ejecuta tanto endpoints HTTP (RFC 8058 one-click) como mailto |
| **Exclusión de Remitentes** | Lista blanca de dominios que quieres conservar (ej. `linkedin.com`, `google.com`) |
| **Log Persistente** | Cada acción de desuscripción se registra en una hoja de Google Sheets |
| **Modo Simulación** | Previsualiza qué se eliminaría antes de ejecutar |
| **Automatización Diaria** | Trigger programado opcional para limpieza diaria automática |
| **Remitentes Bloqueados** | Mantén una lista de remitentes que siempre quieres eliminar |

---

## Qué Se Elimina

El script usa tres consultas de búsqueda para encontrar correos a limpiar:

| Consulta | Qué detecta | Ejemplos |
|----------|-------------|----------|
| `category:promotions` | Pestaña de Promociones de Gmail | Correos de marketing, ofertas, anuncios |
| Patrones en asunto/etiquetas | Correos con `unsubscribe`, `newsletter`, `digest`, `weekly`, `bulletin` en el asunto | Newsletters, resúmenes semanales |
| Patrones de remitente | Correos de `noreply`, `no-reply`, `newsletter`, `marketing`, `promo`, `info@`, `news@` | Notificaciones automáticas, envíos masivos |

> **Nota:** La consulta de patrones de remitente puede coincidir con correos transaccionales legítimos (ej. confirmaciones de pedido de `noreply@`). Usa `EXCLUDED_SENDERS` para proteger los dominios que quieras conservar, y siempre ejecuta `dryRun()` primero para verificar qué se eliminaría.

---

## Inicio Rápido

### 1. Crear el Script

1. Ve a [script.google.com](https://script.google.com) y crea un **Nuevo Proyecto**
2. Elimina el contenido por defecto de `Code.gs`
3. Pega el contenido de [`gmail-cleanup.gs`](gmail-cleanup.gs)

### 2. Habilitar Gmail API

1. En el editor de Apps Script, haz clic en **Servicios** (el ícono `+` a la izquierda)
2. Busca **Gmail API** y haz clic en **Agregar**

### 3. Probar con Simulación

1. Selecciona `dryRun` en el menú desplegable de funciones
2. Haz clic en **Ejecutar** (concede los permisos cuando se solicite)
3. Revisa el **Registro de ejecución** para ver qué se eliminaría

### 4. Ejecutar Limpieza

1. Selecciona `cleanupInbox` en el menú desplegable de funciones
2. Haz clic en **Ejecutar**

### 5. (Opcional) Automatizar

1. Selecciona `setupDailyTrigger` y haz clic en **Ejecutar**
2. El script se ejecutará automáticamente todos los días entre las 2-3 AM

---

## Configuración

Todos los ajustes están claramente etiquetados al **inicio del script** — es la única sección que necesitas editar:

```javascript
// ── Ajustes de Limpieza (promociones y newsletters) ────────

const CLEANUP_OLDER_THAN_DAYS = 365;        // Solo eliminar correos de más de 1 año
const CLEANUP_AUTO_UNSUBSCRIBE = true;       // ¿Desuscribirse antes de eliminar?
const CLEANUP_EXCLUDED_SENDERS = [           // Dominios/remitentes a CONSERVAR
  "linkedin.com",
  "google.com",
  "anthropic.com",
];
const CLEANUP_BLOCKED_SENDERS = [];          // Remitentes a SIEMPRE eliminar

// ── Ajustes de Eliminar Todo (opción nuclear) ──────────────

const DELETE_ALL_OLDER_THAN_DAYS = 365;      // Solo eliminar correos de más de 1 año
const DELETE_ALL_EXCLUDED_SENDERS = [        // Dominios/remitentes a CONSERVAR
  "linkedin.com",
  "google.com",
  "anthropic.com",
];

// ── General ────────────────────────────────────────────────

const PERMANENT_DELETE = false;              // false = papelera, true = eliminado para siempre
const LOG_SPREADSHEET_NAME = "Gmail Cleanup Log";
```

---

## Log de Desuscripciones

Cada intento de desuscripción se registra en una hoja de Google Sheets llamada **"Gmail Cleanup Log"** (se crea automáticamente en tu Google Drive):

| Fecha | De | Método | Destino de Desuscripción | Estado |
|-------|-----|--------|--------------------------|--------|
| 2025-01-15 | `news@example.com` | HTTP | `https://example.com/unsub/...` | Success |
| 2025-01-15 | `promo@store.com` | mailto | `unsub@store.com` | Success |

---

## Funciones Disponibles

| Función | Descripción |
|---------|-------------|
| `cleanupInbox()` | Limpieza principal — elimina promociones/newsletters y desuscribe |
| `dryRun()` | Modo simulación — muestra qué se eliminaría sin ejecutar nada |
| `cleanupBlockedSenders()` | Elimina correos de tu lista de remitentes bloqueados |
| `deleteAllEmails()` | Opción nuclear — elimina TODOS los correos (respeta su propia config de antigüedad/exclusiones) |
| `deleteAllEmailsDryRun()` | Modo simulación para `deleteAllEmails()` |
| `setupDailyTrigger()` | Configura ejecución automática diaria a las 2-3 AM |

---

## Cómo Funciona la Desuscripción

```
Correo encontrado en bandeja
  │
  ├─ ¿Tiene header List-Unsubscribe-Post? → Solicitud POST (RFC 8058 one-click)
  │
  ├─ ¿Tiene List-Unsubscribe con HTTPS? → Solicitud GET a la URL de desuscripción
  │
  ├─ ¿Tiene List-Unsubscribe con mailto? → Envía correo de desuscripción
  │
  └─ Sin header encontrado → Omite desuscripción, igual elimina/mueve a papelera
```

---

## Licencia

MIT
