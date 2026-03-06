<p align="center">
  <a href="README.md">English</a> · <a href="README.es.md">Español</a>
</p>

<p align="center">
  <img src="https://img.icons8.com/color/96/gmail--v1.png" alt="Gmail Cleanup Logo" width="96"/>
</p>

<h1 align="center">Gmail Cleanup</h1>

<p align="center">
  <strong>Automated inbox hygiene &amp; mass unsubscribe for Gmail</strong>
</p>

<p align="center">
  <a href="https://script.google.com"><img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Apps Script"/></a>
  <a href="https://developers.google.com/gmail/api"><img src="https://img.shields.io/badge/Gmail%20API-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail API"/></a>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/zero%20dependencies-success?style=flat-square" alt="Zero Dependencies"/>
  <img src="https://img.shields.io/badge/runs%20on-Google%20Cloud-blue?style=flat-square" alt="Google Cloud"/>
  <img src="https://img.shields.io/badge/cost-free-brightgreen?style=flat-square" alt="Free"/>
</p>

---

## What It Does

A Google Apps Script that automatically cleans your Gmail inbox by removing old promotions, newsletters, and marketing emails — and **unsubscribes you** from them before deleting.

### Features

| Feature | Description |
|---------|-------------|
| **Smart Detection** | Targets Gmail's Promotions category, newsletter patterns, and marketing senders |
| **Auto-Unsubscribe** | Parses `List-Unsubscribe` headers and hits both HTTP (RFC 8058 one-click) and mailto endpoints |
| **Sender Exclusions** | Whitelist domains you want to keep (e.g., `linkedin.com`, `google.com`) |
| **Persistent Log** | Every unsubscribe action is logged to a Google Sheet for full traceability |
| **Dry Run Mode** | Preview what would be deleted before pulling the trigger |
| **Daily Automation** | Optional time-based trigger for hands-free daily cleanup |
| **Blocked Senders** | Maintain a blocklist for senders you always want nuked |

---

## What Gets Targeted

The script uses three search queries to find emails to clean up:

| Query | What it catches | Examples |
|-------|----------------|----------|
| `category:promotions` | Gmail's Promotions tab | Marketing emails, deals, ads |
| Subject/label patterns | Emails with `unsubscribe`, `newsletter`, `digest`, `weekly`, `bulletin` in subject | Newsletters, weekly digests |
| Sender patterns | Emails from `noreply`, `no-reply`, `newsletter`, `marketing`, `promo`, `info@`, `news@` | Automated notifications, marketing blasts |

> **Note:** The sender patterns query can match legitimate transactional emails (e.g., order confirmations from `noreply@`). Use `EXCLUDED_SENDERS` to whitelist domains you want to keep, and always run `dryRun()` first to verify what would be deleted.

---

## Quick Start

### 1. Create the Script

1. Go to [script.google.com](https://script.google.com) and create a **New Project**
2. Delete the default `Code.gs` content
3. Paste the contents of [`gmail-cleanup.gs`](gmail-cleanup.gs)

### 2. Enable Gmail API

1. In the Apps Script editor, click **Services** (the `+` icon on the left)
2. Find **Gmail API** and click **Add**

### 3. Test with Dry Run

1. Select `dryRun` from the function dropdown
2. Click **Run** (grant permissions when prompted)
3. Check **Execution log** to see what would be deleted

### 4. Run Cleanup

1. Select `cleanupInbox` from the function dropdown
2. Click **Run**

### 5. (Optional) Automate

1. Select `setupDailyTrigger` and click **Run**
2. The script will now run daily at 2-3 AM automatically

---

## Configuration

All settings are clearly labeled at the **top of the script** — it's the only section you need to edit:

```javascript
// ── Cleanup Settings (promotions & newsletters) ────────────

const CLEANUP_OLDER_THAN_DAYS = 365;        // Only delete emails older than 1 year
const CLEANUP_AUTO_UNSUBSCRIBE = true;       // Unsubscribe before deleting?
const CLEANUP_EXCLUDED_SENDERS = [           // Domains/senders to KEEP
  "linkedin.com",
  "google.com",
  "anthropic.com",
];
const CLEANUP_BLOCKED_SENDERS = [];          // Senders to ALWAYS delete

// ── Delete All Settings (nuclear option) ───────────────────

const DELETE_ALL_OLDER_THAN_DAYS = 365;      // Only delete emails older than 1 year
const DELETE_ALL_EXCLUDED_SENDERS = [        // Domains/senders to KEEP
  "linkedin.com",
  "google.com",
  "anthropic.com",
];

// ── General ────────────────────────────────────────────────

const PERMANENT_DELETE = false;              // false = trash, true = gone forever
const LOG_SPREADSHEET_NAME = "Gmail Cleanup Log";
```

---

## Unsubscribe Log

Every unsubscribe attempt is logged to a Google Sheet called **"Gmail Cleanup Log"** (auto-created in your Google Drive):

| Date | From | Method | Unsubscribe Target | Status |
|------|------|--------|--------------------|--------|
| 2025-01-15 | `news@example.com` | HTTP | `https://example.com/unsub/...` | Success |
| 2025-01-15 | `promo@store.com` | mailto | `unsub@store.com` | Success |

---

## Available Functions

| Function | Description |
|----------|-------------|
| `cleanupInbox()` | Main cleanup — deletes promotions/newsletters and unsubscribes |
| `dryRun()` | Preview mode — shows what would be deleted without acting |
| `cleanupBlockedSenders()` | Deletes emails from your blocked senders list |
| `deleteAllEmails()` | Nuclear option — deletes ALL emails (respects its own age/exclusion config) |
| `deleteAllEmailsDryRun()` | Preview mode for `deleteAllEmails()` |
| `setupDailyTrigger()` | Sets up automatic daily execution at 2-3 AM |

---

## How Unsubscribe Works

```
Email found in inbox
  │
  ├─ Has List-Unsubscribe-Post header? → POST request (RFC 8058 one-click)
  │
  ├─ Has List-Unsubscribe with HTTPS? → GET request to unsubscribe URL
  │
  ├─ Has List-Unsubscribe with mailto? → Sends unsubscribe email
  │
  └─ No header found → Skip unsubscribe, still delete/trash
```

---

## License

MIT
