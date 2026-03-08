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

### Seguro por Defecto

De fábrica, el script hace dos cosas:

1. **Desuscribe y mueve a la papelera promociones/newsletters** con más de **1 día** de antigüedad
2. **Mueve el spam a la Papelera**

Todo va a la Papelera (recuperable por 30 días) — nada se elimina permanentemente. Las demás funciones son opcionales:

| Ajuste | Valor por defecto | Qué hace |
|--------|-------------------|----------|
| `CLEANUP_OLDER_THAN` | `1 día` | Antigüedad mínima para limpieza de promociones |
| `EMPTY_SPAM` | `true` | Mover spam a Papelera en cada ejecución |
| `PERMANENT_DELETE` | `false` | Usar Papelera (no eliminar permanentemente) |
| `ENABLE_DELETE_ALL` | `false` | Función nuclear de eliminar todo (deshabilitada) |
| `CLEANUP_BLOCKED_SENDERS` | `[]` | Lista de bloqueados (vacía) |

### Características

| Característica | Descripción |
|----------------|-------------|
| **Detección Inteligente** | Detecta la categoría Promociones de Gmail, patrones de newsletters y remitentes de marketing |
| **Auto-Desuscripción** | Analiza los headers `List-Unsubscribe` y ejecuta tanto endpoints HTTP (RFC 8058 one-click) como mailto |
| **Exclusión de Remitentes** | Lista blanca de dominios que quieres conservar — incluye instituciones de CL/CO/VE, o gestiona desde Google Sheets |
| **Solo Desuscribir** | Desuscribirse de remitentes pero conservar sus correos (ideal para newsletters que quieres archivar) |
| **Listas Dinámicas** | Agregar/quitar remitentes excluidos o solo-desuscribir directamente desde Google Sheets |
| **Limpieza de Spam** | Mueve el spam a la Papelera en cada ejecución (activado por defecto, respeta `PERMANENT_DELETE`) |
| **Log Persistente** | Cada acción de desuscripción se registra en una hoja de Google Sheets |
| **Modo Simulación** | Previsualiza qué se eliminaría antes de ejecutar |
| **Automatización Diaria** | Trigger programado opcional para limpieza diaria automática |
| **Protección Inteligente** | Detección de palabras clave (ES + EN) protege correos de salud, gobierno, migración, legales, educación y transaccionales — pero solo en consultas ambiguas. `category:promotions` de Gmail se respeta y elimina sin verificación de keywords |
| **Remitentes Bloqueados** | Mantén una lista de remitentes que siempre quieres eliminar |

---

## Cómo Se Tratan los Remitentes

El script trata a los remitentes de tres formas distintas:

| Lista | ¿Desuscribir? | ¿Eliminar? | Caso de uso |
|-------|---------------|------------|-------------|
| **Excluidos** | No | No | Bancos, servicios importantes — no tocar nada |
| **Solo Desuscribir** | Sí | No | Newsletters que quieres dejar de recibir pero conservar el archivo |
| **Por defecto** (todo lo demás) | Sí | Sí | Spam, promociones — desuscribir y eliminar |

Ambas listas (**Excluidos** y **Solo Desuscribir**) se pueden gestionar de dos formas:
1. **En el script** — editar los arrays al inicio del archivo
2. **En Google Sheets** — agregar remitentes en las pestañas "Excluded Senders" o "Unsubscribe Only" (se crean automáticamente en la primera ejecución)

---

## Qué Se Elimina

El script usa tres consultas de búsqueda para encontrar correos a limpiar:

| Consulta | Qué detecta | Ejemplos |
|----------|-------------|----------|
| `category:promotions` | Pestaña de Promociones de Gmail | Correos de marketing, ofertas, anuncios |
| Patrones en asunto/etiquetas | Correos con `unsubscribe`, `newsletter`, `digest`, `weekly`, `bulletin` en el asunto | Newsletters, resúmenes semanales |
| Patrones de remitente | Correos de `noreply`, `no-reply`, `newsletter`, `marketing`, `promo`, `info@`, `news@` | Notificaciones automáticas, envíos masivos |

> **Nota:** La consulta de patrones de remitente puede coincidir con correos transaccionales legítimos (ej. confirmaciones de pedido de `noreply@`). Usa `EXCLUDED_SENDERS` para proteger los dominios que quieras conservar, y siempre ejecuta `dryRun()` primero para verificar.

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

### 5. Automatizar

1. Selecciona `setup` en el menú desplegable y haz clic en **Ejecutar**
2. Esto crea la hoja de Google Sheets, configura ambos triggers y listo:
   - **Diario a las 2-3 AM** — `cleanupInbox` elimina promociones (rápido, sin overhead de API)
   - **Cada 3 días a las 3-4 AM** — `unsubscribeInbox` cancela suscripciones

---

## Configuración

Todos los ajustes están claramente etiquetados al **inicio del script** — es la única sección que necesitas editar:

```javascript
// ── Ajustes de Limpieza ────────────────────────────────────

const CLEANUP_OLDER_THAN = 1;                // ¿Qué tan antiguos? (número)
const CLEANUP_OLDER_THAN_UNIT = "days";      // "days", "months", o "years"

const EXCLUDED_SENDERS = [                   // Dominios/remitentes a NUNCA tocar
  "linkedin.com", "google.com", "anthropic.com",
  "github.com", "gitlab.com",
  // Instituciones de Chile, Colombia y Venezuela incluidas:
  // bancos, salud, gobierno, migración, legal
  // ... (lista completa en el script)
];

const UNSUBSCRIBE_ONLY_SENDERS = [           // Desuscribir pero CONSERVAR correos
  // "newsletter@blog.com",
];

const CLEANUP_BLOCKED_SENDERS = [];          // Remitentes a SIEMPRE eliminar

// ── Ajustes de Eliminar Todo (opción nuclear) ──────────────

const ENABLE_DELETE_ALL = false;             // ¿Habilitar la función deleteAllEmails?
const DELETE_ALL_OLDER_THAN = 5;             // ¿Qué tan antiguos? (número)
const DELETE_ALL_OLDER_THAN_UNIT = "years";  // "days", "months", o "years"

// ── General ────────────────────────────────────────────────

const EMPTY_SPAM = true;                     // ¿Limpiar carpeta de spam en cada ejecución?
const PERMANENT_DELETE = false;              // false = papelera, true = eliminado para siempre
const LOG_SPREADSHEET_NAME = "Gmail Cleanup Log";
```

---

## Pestañas de Google Sheets

El script crea automáticamente una hoja **"Gmail Cleanup Log"** en tu Google Drive con cuatro pestañas:

| Pestaña | Tipo | Propósito |
|---------|------|-----------|
| **Unsubscribe Log** | Log | Registra cada intento de desuscripción (fecha, remitente, método, estado) |
| **Protected Senders** | Log | Registra remitentes que fueron omitidos durante la limpieza (con razón: excluido, salud, gobierno, etc.) |
| **Excluded Senders** | Editable | Agrega dominios/correos aquí para excluirlos de eliminación — sin tocar código |
| **Unsubscribe Only** | Editable | Agrega dominios/correos aquí para desuscribirte pero conservar sus correos |

Solo escribe un dominio (ej. `mibanco.cl`) o correo en la columna A y el script lo detecta en la siguiente ejecución.

---

## Funciones Disponibles

| Función | Descripción |
|---------|-------------|
| `setup()` | **Setup completo** — crea la hoja de Google Sheets y ambos triggers. Ejecutar una sola vez |
| `cleanupInbox()` | Limpieza diaria — elimina promociones/newsletters y purga spam (sin desuscribir) |
| `unsubscribeInbox()` | Pasada de desuscripción — cancela suscripciones sin eliminar correos |
| `dryRun()` | Modo simulación — muestra qué pasaría sin ejecutar nada |
| `cleanupBlockedSenders()` | Elimina correos de tu lista de remitentes bloqueados |
| `deleteAllEmails()` | Opción nuclear — elimina TODOS los correos (deshabilitado por defecto, activar con `ENABLE_DELETE_ALL = true`) |
| `deleteAllEmailsDryRun()` | Modo simulación para `deleteAllEmails()` (también requiere `ENABLE_DELETE_ALL = true`) |
| `setupSheet()` | Crea/actualiza las pestañas de Google Sheets y sincroniza valores del script |
| `setupTriggers()` | Configura ambos triggers: eliminación diaria + desuscripción cada 3 días |

---

## Cómo Decide Qué Hacer

```
Correo encontrado en bandeja
  │
  ├─ ¿Remitente en lista EXCLUIDOS?  → Omitir (no desuscribir, no eliminar)
  ├─ ¿Correo protegido detectado?   → Omitir (salud, gobierno, migración, legal, educación o transaccional por palabras clave)
  │
  ├─ ¿Remitente en lista SOLO DESUSCRIBIR? → Desuscribir, pero conservar correo
  │
  └─ Comportamiento por defecto:
       │
       ├─ ¿Tiene header List-Unsubscribe-Post? → POST (RFC 8058 one-click)
       ├─ ¿Tiene List-Unsubscribe con HTTPS?   → Solicitud GET
       ├─ ¿Tiene List-Unsubscribe con mailto?  → Envía correo de desuscripción
       └─ ¿Sin header? → Omitir desuscripción
       │
       └─ Eliminar / mover a papelera
```

---

## Licencia

MIT
