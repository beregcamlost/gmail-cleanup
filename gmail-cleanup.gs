// ============================================================
//  GMAIL CLEANUP & AUTO-UNSUBSCRIBE
// ============================================================
//
//  HOW TO USE:
//    1. Go to https://script.google.com
//    2. Create a new project and paste this entire script
//    3. Click "Services" (+) on the left → add "Gmail API"
//    4. CHANGE THE SETTINGS BELOW to fit your needs
//    5. Select "dryRun" from the dropdown and click Run (to preview)
//    6. Select "cleanupInbox" and click Run (to actually clean)
//
// ============================================================


// ************************************************************
//  SETTINGS — CHANGE THESE TO FIT YOUR NEEDS
//  (This is the only section you need to edit!)
// ************************************************************

// ── Cleanup Settings (used by "cleanupInbox") ──────────────
//    Targets: promotions, newsletters, and marketing emails

// How old must an email be before it gets deleted?
// Set the number and the unit ("days", "months", or "years").
// Examples: 1 "years"  = older than 1 year
//           6 "months" = older than 6 months
//           90 "days"  = older than 90 days
//           0 (any)    = delete all matching emails regardless of age
const CLEANUP_OLDER_THAN = 1;
const CLEANUP_OLDER_THAN_UNIT = "days"; // "days", "months", or "years"

// Should the script try to unsubscribe you from mailing lists?
// true  = yes, unsubscribe before deleting
// false = no, just delete without unsubscribing
const CLEANUP_AUTO_UNSUBSCRIBE = true;

// ── Excluded Senders (shared by all functions) ─────────────
//    These senders are NEVER touched — no unsubscribe, no delete.
//    You can also add senders dynamically via the Google Sheet
//    (see the "Excluded Senders" tab in your "Gmail Cleanup Log").
const EXCLUDED_SENDERS = [
  "linkedin.com",
  "google.com",
  "anthropic.com",
  // Add more here, e.g.:
  // "amazon.com",
  // "mom@gmail.com",

  // ════════════════════════════════════════════════════════════
  // CHILE (.cl)
  // ════════════════════════════════════════════════════════════

  // ── Chilean Banks ──
  "bancochile.cl",
  "bancoestado.cl",
  "santander.cl",
  "bci.cl",
  "scotiabank.cl",
  "itau.cl",
  "bice.cl",
  "bancofalabella.cl",
  "bancoripley.cl",
  "bancosecurity.cl",
  "bancoconsorcio.cl",
  "bancointernacional.cl",
  "coopeuch.cl",
  "tenpo.cl",

  // ── Chilean Health (ISAPREs, clinics, hospitals) ──
  "fonasa.cl",
  "colmena.cl",
  "cruzblanca.cl",
  "banmedica.cl",
  "vidatres.cl",
  "nuevamasvida.cl",
  "redsalud.cl",
  "integramedica.cl",
  "megasalud.cl",
  "alemana.cl",
  "uccristus.cl",
  "clinicasantamaria.cl",
  "clinicalascondes.cl",
  "indisa.cl",
  "davila.cl",
  "biomerieux.cl",

  // ── Chilean Government ──
  "gob.cl",
  "sii.cl",
  "tesoreria.cl",
  "registrocivil.cl",
  "chileatiende.cl",
  "contraloria.cl",
  "servel.cl",
  "sernac.cl",
  "sence.cl",
  "serviu.cl",
  "minvu.cl",
  "minsal.cl",
  "mineduc.cl",
  "mintrab.cl",
  "minjusticia.cl",
  "interior.gob.cl",
  "hacienda.cl",
  "defensoria.cl",
  "fiscaliadechile.cl",
  "poderjudicial.cl",
  "senado.cl",
  "camara.cl",
  "bcn.cl",
  "carabineros.cl",
  "investigaciones.cl",
  "bomberos.cl",
  "ips.gob.cl",
  "previred.com",

  // ── Chilean Immigration ──
  "extranjeria.gob.cl",
  "serviciomigraciones.cl",
  "migraciones.gob.cl",

  // ── Chilean Legal ──
  "pjud.cl",
  "dpp.cl",
  "caj.cl",
  "notarios.cl",

  // ════════════════════════════════════════════════════════════
  // COLOMBIA (.co)
  // ════════════════════════════════════════════════════════════

  // ── Colombian Banks ──
  "bancolombia.com.co",
  "davivienda.com",
  "bancodebogota.com.co",
  "bbva.com.co",
  "grupobancolombia.com",
  "bancopichincha.com.co",
  "bancocajasocial.com",
  "bancoavvillas.com.co",
  "bancopopular.com.co",
  "bancooccidente.com.co",
  "scotiabank.com.co",
  "citibank.com.co",
  "nequi.com.co",
  "daviplata.com",
  "nu.com.co",
  "rappipay.co",

  // ── Colombian Health (EPS, clinics, hospitals) ──
  "nuevaeps.com.co",
  "sura.com.co",
  "epssanitas.com",
  "saludtotal.com.co",
  "coomeva.com.co",
  "famisanar.com.co",
  "compensar.com",
  "colsanitas.com",
  "medimas.com.co",
  "aliansalud.com.co",
  "cafesalud.com.co",
  "fundacionsantafe.org",
  "clinicadelcountry.com",
  "shaio.org",
  "fsfb.org.co",
  "clinicamarly.com.co",

  // ── Colombian Government ──
  "gov.co",
  "dian.gov.co",
  "registraduria.gov.co",
  "supernotariado.gov.co",
  "procuraduria.gov.co",
  "contraloria.gov.co",
  "fiscalia.gov.co",
  "defensoria.gov.co",
  "policia.gov.co",
  "mininterior.gov.co",
  "minhacienda.gov.co",
  "minsalud.gov.co",
  "mineducacion.gov.co",
  "mintrabajo.gov.co",
  "minjusticia.gov.co",
  "cancilleria.gov.co",
  "senado.gov.co",
  "camara.gov.co",
  "corteconstitucional.gov.co",
  "cortesuprema.gov.co",
  "consejodeestado.gov.co",
  "ramajudicial.gov.co",
  "sic.gov.co",
  "superfinanciera.gov.co",
  "supersalud.gov.co",
  "colpensiones.gov.co",
  "icetex.gov.co",

  // ── Colombian Immigration ──
  "migracioncolombia.gov.co",
  "cancilleria.gov.co",

  // ── Colombian Legal ──
  "ramajudicial.gov.co",
  "notariado.gov.co",
  "colegiodeabogados.co",

  // ════════════════════════════════════════════════════════════
  // VENEZUELA (.ve)
  // ════════════════════════════════════════════════════════════

  // ── Venezuelan Banks ──
  "banesco.com",
  "mercantilbanco.com",
  "provincial.com",
  "bnc.com.ve",
  "bancaribe.com.ve",
  "bod.com.ve",
  "bicentenario.com.ve",
  "banfanb.com.ve",
  "exteriorbank.com",
  "sofitasa.com",
  "bancoplaza.com",
  "bangente.com.ve",
  "bancamiga.com",
  "mibanco.com.ve",

  // ── Venezuelan Health ──
  "ivss.gob.ve",
  "mpps.gob.ve",
  "clinicascaracas.com",
  "sanatorioadventista.org.ve",
  "policlinicametropolitana.com",
  "clinicaelavila.com",

  // ── Venezuelan Government ──
  "gob.ve",
  "seniat.gob.ve",
  "cne.gob.ve",
  "mpps.gob.ve",
  "mppre.gob.ve",
  "mppe.gob.ve",
  "mppt.gob.ve",
  "mppj.gob.ve",
  "mpprijp.gob.ve",
  "tsj.gob.ve",
  "fiscalia.gob.ve",
  "defensoria.gob.ve",
  "contraloria.gob.ve",
  "asambleanacional.gob.ve",
  "onidex.gob.ve",
  "saren.gob.ve",
  "sundde.gob.ve",
  "indepabis.gob.ve",

  // ── Venezuelan Immigration ──
  "saime.gob.ve",
  "migracion.gob.ve",

  // ── Venezuelan Legal ──
  "tsj.gob.ve",
  "defensoria.gob.ve",
];

// ── Unsubscribe Only (unsub but keep emails) ───────────────
//    Senders listed here will be unsubscribed from mailing lists
//    but their emails will NOT be deleted. Useful for newsletters
//    you want to stop receiving but want to keep the archive.
//    You can also add senders via the "Unsubscribe Only" tab
//    in your Google Sheet.
const UNSUBSCRIBE_ONLY_SENDERS = [
  // "newsletter@interesting-blog.com",
  // "updates@service-i-use.com",
];

// ── Blocked Senders (always delete) ────────────────────────
//    Senders you ALWAYS want deleted, no matter what.
//    Leave empty [] if you don't have any.
const CLEANUP_BLOCKED_SENDERS = [
  // "noreply@spammy-company.com",
  // "deals@annoying-store.com",
];

// ── Delete All Settings (used by "deleteAllEmails") ────────
//    WARNING: This deletes ALL emails, not just promotions!
//    Use this for a full inbox wipe with your own filters.

// Enable or disable the "deleteAllEmails" function.
// true  = allowed to run
// false = disabled (will log a warning and exit without deleting)
const ENABLE_DELETE_ALL = false;

// How old must an email be before it gets deleted?
// Set the number and the unit ("days", "months", or "years").
const DELETE_ALL_OLDER_THAN = 5;
const DELETE_ALL_OLDER_THAN_UNIT = "years"; // "days", "months", or "years"

// Uses the same EXCLUDED_SENDERS list from above.

// ── General Settings ───────────────────────────────────────

// Also empty the Spam folder on each run?
// true  = yes, permanently delete all spam
// false = no, leave spam alone
const EMPTY_SPAM = false;

// What happens to deleted emails?
// false = move to Trash (you can recover them for 30 days)
// true  = delete permanently (cannot be recovered!)
const PERMANENT_DELETE = false;

// Name of the Google Sheet where logs and dynamic lists are stored.
// A spreadsheet with this name will be created in your Google Drive.
const LOG_SPREADSHEET_NAME = "Gmail Cleanup Log";


// ************************************************************
//  STOP — You don't need to change anything below this line!
//  The rest is the script logic.
// ************************************************************

function toDays_(value, unit) {
  if (value === 0) return 0;
  switch (unit) {
    case "years":  return value * 365;
    case "months": return value * 30;
    case "days":   return value;
    default:       return value;
  }
}

const CONFIG = {
  BATCH_SIZE: 500,
  PERMANENT_DELETE: PERMANENT_DELETE,
  AUTO_UNSUBSCRIBE: CLEANUP_AUTO_UNSUBSCRIBE,
  OLDER_THAN_DAYS: toDays_(CLEANUP_OLDER_THAN, CLEANUP_OLDER_THAN_UNIT),
  EXCLUDED_SENDERS: EXCLUDED_SENDERS,
  UNSUBSCRIBE_ONLY_SENDERS: UNSUBSCRIBE_ONLY_SENDERS,
  BLOCKED_SENDERS: CLEANUP_BLOCKED_SENDERS,
  UNSUBSCRIBED_LABEL: "_unsubscribed",
  LOG_SPREADSHEET_NAME: LOG_SPREADSHEET_NAME,
};

const DELETE_ALL_OPTIONS = {
  OLDER_THAN_DAYS: toDays_(DELETE_ALL_OLDER_THAN, DELETE_ALL_OLDER_THAN_UNIT),
  EXCLUDED_SENDERS: EXCLUDED_SENDERS,
  PERMANENT_DELETE: PERMANENT_DELETE,
};

// ── Cached dynamic lists (loaded once per run) ─────────────
let dynamicExcluded_ = null;
let dynamicUnsubOnly_ = null;

function getDynamicExcluded_() {
  if (dynamicExcluded_) return dynamicExcluded_;
  dynamicExcluded_ = loadSheetList_("Excluded Senders");
  return dynamicExcluded_;
}

function getDynamicUnsubOnly_() {
  if (dynamicUnsubOnly_) return dynamicUnsubOnly_;
  dynamicUnsubOnly_ = loadSheetList_("Unsubscribe Only");
  return dynamicUnsubOnly_;
}

// Placeholders and junk that should never be treated as real senders
const IGNORED_VALUES_ = ["example.com", "sender / domain", "dominio / remitente"];

// Minimum valid pattern: at least "x.y" (e.g., "a.cl")
const VALID_SENDER_PATTERN_ = /^[^@\s]+(\.[^@\s]+)+$|^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Reads a single-column list from a named tab in the log spreadsheet.
 * Bulletproof: handles empty rows, junk, commas, angle brackets, numbers,
 * missing headers, placeholders, and duplicate entries.
 * Returns an array of unique lowercase strings.
 */
function loadSheetList_(tabName) {
  const ss = getOrCreateSpreadsheet_();
  let sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.getRange("A1").setValue("Sender / Domain");
    sheet.getRange("A1:A1").setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.getRange("A2").setNote("Type one domain or email per row.\nExamples: mybank.com, news@blog.com\nYou can also use commas: a.com, b.com");

    // Pre-populate with hardcoded values so users see the full list
    const seedValues =
      tabName === "Excluded Senders" ? CONFIG.EXCLUDED_SENDERS :
      tabName === "Unsubscribe Only" ? CONFIG.UNSUBSCRIBE_ONLY_SENDERS :
      [];

    if (seedValues.length > 0) {
      const rows = seedValues.map((v) => [v]);
      sheet.getRange(2, 1, rows.length, 1).setValues(rows);
    }

    return seedValues.map((v) => v.toLowerCase());
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return [];

  // Read ALL rows (including row 1 in case someone deleted the header)
  const raw = sheet
    .getRange(1, 1, lastRow, 1)
    .getValues()
    .flat();

  const results = new Set();

  for (const cell of raw) {
    if (cell === null || cell === undefined) continue;

    const str = String(cell).trim();
    if (!str) continue;

    // Support comma-separated values in a single cell
    const parts = str.split(/[,;]+/);

    for (let part of parts) {
      // Strip angle brackets, quotes, and whitespace
      part = part.trim().toLowerCase().replace(/[<>"']/g, "").trim();

      if (!part) continue;
      if (IGNORED_VALUES_.includes(part)) continue;
      if (!VALID_SENDER_PATTERN_.test(part)) continue;

      results.add(part);
    }
  }

  return Array.from(results);
}

/**
 * Main cleanup — deletes promotions, newsletters, and marketing emails.
 * Also unsubscribes you from mailing lists if enabled.
 */
function cleanupInbox() {
  setupSheet();

  const queries = [
    "category:promotions",
    "label:^unsub OR subject:(unsubscribe OR newsletter OR digest OR weekly OR bulletin)",
    'from:(noreply OR no-reply OR newsletter OR marketing OR promo OR info@ OR news@)',
  ];

  let totalDeleted = 0;
  let totalUnsubscribed = 0;
  let totalUnsubOnly = 0;

  for (const query of queries) {
    const result = processQuery_(query);
    totalDeleted += result.deleted;
    totalUnsubscribed += result.unsubscribed;
    totalUnsubOnly += result.unsubOnly;
  }

  let spamDeleted = 0;
  if (EMPTY_SPAM) {
    spamDeleted = emptySpam_();
  }

  Logger.log(
    `Done. Deleted: ${totalDeleted}, Unsubscribed: ${totalUnsubscribed}, Unsub-only (kept): ${totalUnsubOnly}, Spam purged: ${spamDeleted}.`
  );
}

/**
 * Preview mode — shows what cleanupInbox would do without actually doing it.
 * Always run this first!
 */
function dryRun() {
  const queries = [
    "category:promotions",
    "label:^unsub OR subject:(unsubscribe OR newsletter OR digest OR weekly OR bulletin)",
    'from:(noreply OR no-reply OR newsletter OR marketing OR promo OR info@ OR news@)',
  ];

  const seen = new Set();

  for (const query of queries) {
    const fullQuery = `in:inbox ${query}`;
    const threads = GmailApp.search(fullQuery, 0, 50);

    for (const thread of threads) {
      const id = thread.getId();
      if (seen.has(id)) continue;

      const msg = thread.getMessages()[0];
      const from = msg.getFrom();

      if (isExcluded_(msg)) {
        if (isProtectedByKeywords_(msg)) {
          Logger.log(`[SKIP - PROTECTED] From: ${from} | Subject: ${msg.getSubject()}`);
        }
        continue;
      }

      seen.add(id);

      if (isUnsubOnly_(msg)) {
        Logger.log(`[UNSUB ONLY - KEEP] From: ${from} | Subject: ${msg.getSubject()}`);
      } else {
        Logger.log(`[WOULD DELETE] From: ${from} | Subject: ${msg.getSubject()}`);
      }
    }
  }

  Logger.log(`\nTotal unique threads that would be affected: ${seen.size}`);
  Logger.log("Run cleanupInbox() to actually execute.");
}

/**
 * Nuclear option — deletes ALL emails from your inbox.
 * Respects EXCLUDED_SENDERS (hardcoded + dynamic from sheet).
 */
function deleteAllEmails() {
  if (!ENABLE_DELETE_ALL) {
    Logger.log("deleteAllEmails is disabled. Set ENABLE_DELETE_ALL = true to use it.");
    return;
  }
  setupSheet();
  const opts = DELETE_ALL_OPTIONS;
  const olderThan = opts.OLDER_THAN_DAYS > 0 ? ` older_than:${opts.OLDER_THAN_DAYS}d` : "";
  const query = `in:inbox${olderThan}`;

  let totalDeleted = 0;
  let totalSkipped = 0;
  let threads;

  do {
    threads = GmailApp.search(query, 0, CONFIG.BATCH_SIZE);

    for (const thread of threads) {
      const msg = thread.getMessages()[0];

      const reason = getExclusionReason_(msg);
      if (reason) {
        logProtected_(msg, reason);
        totalSkipped++;
        continue;
      }

      if (opts.PERMANENT_DELETE) {
        Gmail.Users.Threads.remove("me", thread.getId());
      } else {
        thread.moveToTrash();
      }
      totalDeleted++;
    }
  } while (threads.length === CONFIG.BATCH_SIZE);

  Logger.log(`Done. Deleted: ${totalDeleted} threads, Skipped (excluded): ${totalSkipped}.`);
}

/**
 * Preview mode for deleteAllEmails — shows what would be deleted.
 */
function deleteAllEmailsDryRun() {
  if (!ENABLE_DELETE_ALL) {
    Logger.log("deleteAllEmails is disabled. Set ENABLE_DELETE_ALL = true to use it.");
    return;
  }
  const opts = DELETE_ALL_OPTIONS;
  const olderThan = opts.OLDER_THAN_DAYS > 0 ? ` older_than:${opts.OLDER_THAN_DAYS}d` : "";
  const query = `in:inbox${olderThan}`;

  const threads = GmailApp.search(query, 0, 50);
  let count = 0;
  let skipped = 0;

  for (const thread of threads) {
    const msg = thread.getMessages()[0];

    if (isExcluded_(msg)) {
      Logger.log(`[SKIP - EXCLUDED] From: ${msg.getFrom()} | Subject: ${msg.getSubject()}`);
      skipped++;
    } else {
      Logger.log(`[WOULD DELETE] From: ${msg.getFrom()} | Subject: ${msg.getSubject()}`);
      count++;
    }
  }

  Logger.log(`\nWould delete: ${count} | Would skip: ${skipped} (showing first 50 matches)`);
  Logger.log("Run deleteAllEmails() to execute.");
}

/**
 * Deletes emails from your blocked senders list.
 */
function cleanupBlockedSenders() {
  if (CONFIG.BLOCKED_SENDERS.length === 0) {
    Logger.log("No blocked senders configured.");
    return;
  }

  let totalDeleted = 0;

  for (const sender of CONFIG.BLOCKED_SENDERS) {
    const query = `in:inbox from:${sender}`;
    const threads = GmailApp.search(query, 0, CONFIG.BATCH_SIZE);

    for (const thread of threads) {
      if (CONFIG.PERMANENT_DELETE) {
        Gmail.Users.Threads.remove("me", thread.getId());
      } else {
        thread.moveToTrash();
      }
      totalDeleted++;
    }
  }

  Logger.log(`Blocked senders cleanup: ${totalDeleted} threads deleted.`);
}

/**
 * Creates/updates the Google Sheet tabs and syncs hardcoded values.
 * Run this anytime to set up or refresh the sheet without running a cleanup.
 */
function setupSheet() {
  const ss = getOrCreateSpreadsheet_();

  // Ensure all tabs exist and are populated
  syncSheetTab_(ss, "Excluded Senders", CONFIG.EXCLUDED_SENDERS);
  syncSheetTab_(ss, "Unsubscribe Only", CONFIG.UNSUBSCRIBE_ONLY_SENDERS);

  // Ensure log and protected tabs exist
  getLogSheet_();
  if (!ss.getSheetByName("Protected Senders")) {
    const ps = ss.insertSheet("Protected Senders");
    ps.appendRow(["Date", "From", "Subject", "Reason"]);
    ps.getRange("1:1").setFontWeight("bold");
    ps.setFrozenRows(1);
  }

  Logger.log(`Sheet ready: ${ss.getUrl()}`);
}

/**
 * Sets up automatic daily cleanup (runs between 2-3 AM).
 */
function setupDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === "cleanupInbox") {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  ScriptApp.newTrigger("cleanupInbox")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();

  Logger.log("Daily cleanup trigger set for 2-3 AM.");
}


// ── Internal functions (don't touch) ───────────────────────

function processQuery_(query) {
  const olderThan =
    CONFIG.OLDER_THAN_DAYS > 0
      ? ` older_than:${CONFIG.OLDER_THAN_DAYS}d`
      : "";
  const fullQuery = `in:inbox ${query}${olderThan}`;

  let deleted = 0;
  let unsubscribed = 0;
  let unsubOnly = 0;
  let threads;

  do {
    threads = GmailApp.search(fullQuery, 0, CONFIG.BATCH_SIZE);

    for (const thread of threads) {
      const firstMessage = thread.getMessages()[0];

      // Fully excluded — skip entirely and log
      const exclusionReason = getExclusionReason_(firstMessage);
      if (exclusionReason) {
        logProtected_(firstMessage, exclusionReason);
        continue;
      }

      // Unsubscribe only — unsub but don't delete
      if (isUnsubOnly_(firstMessage)) {
        if (CONFIG.AUTO_UNSUBSCRIBE && tryUnsubscribe_(firstMessage)) {
          unsubOnly++;
        }
        continue;
      }

      // Default — unsub + delete
      if (CONFIG.AUTO_UNSUBSCRIBE) {
        if (tryUnsubscribe_(firstMessage)) {
          unsubscribed++;
        }
      }

      if (CONFIG.PERMANENT_DELETE) {
        Gmail.Users.Threads.remove("me", thread.getId());
      } else {
        thread.moveToTrash();
      }
      deleted++;
    }
  } while (threads.length === CONFIG.BATCH_SIZE);

  return { deleted, unsubscribed, unsubOnly };
}

function tryUnsubscribe_(message) {
  const messageId = message.getId();
  const unsubLabel = getOrCreateLabel_(CONFIG.UNSUBSCRIBED_LABEL);

  const thread = message.getThread();
  const labels = thread.getLabels();
  if (labels.some((l) => l.getName() === CONFIG.UNSUBSCRIBED_LABEL)) {
    return false;
  }

  try {
    const raw = Gmail.Users.Messages.get("me", messageId, {
      format: "metadata",
      metadataHeaders: ["List-Unsubscribe", "List-Unsubscribe-Post"],
    });

    const headers = raw.payload.headers || [];
    const unsubHeader = headers.find(
      (h) => h.name.toLowerCase() === "list-unsubscribe"
    );

    if (!unsubHeader) return false;

    const value = unsubHeader.value;

    const httpsMatch = value.match(/<(https?:\/\/[^>]+)>/);
    if (httpsMatch) {
      const url = httpsMatch[1];
      const postHeader = headers.find(
        (h) => h.name.toLowerCase() === "list-unsubscribe-post"
      );

      try {
        if (postHeader) {
          UrlFetchApp.fetch(url, {
            method: "post",
            payload: postHeader.value || "List-Unsubscribe=One-Click",
            muteHttpExceptions: true,
            followRedirects: true,
          });
        } else {
          UrlFetchApp.fetch(url, {
            method: "get",
            muteHttpExceptions: true,
            followRedirects: true,
          });
        }
        thread.addLabel(unsubLabel);
        logUnsubscribe_(message.getFrom(), "HTTP", url, "Success");
        Logger.log(`Unsubscribed (HTTP): ${message.getFrom()}`);
        return true;
      } catch (e) {
        logUnsubscribe_(message.getFrom(), "HTTP", url, `Failed: ${e}`);
        Logger.log(`HTTP unsubscribe failed for ${message.getFrom()}: ${e}`);
      }
    }

    const mailtoMatch = value.match(/<mailto:([^>?]+)(\?subject=([^>]*))?>/);
    if (mailtoMatch) {
      const email = mailtoMatch[1];
      const subject = mailtoMatch[3] || "Unsubscribe";

      GmailApp.sendEmail(email, subject, "Unsubscribe", {
        noReply: true,
      });
      thread.addLabel(unsubLabel);
      logUnsubscribe_(message.getFrom(), "mailto", email, "Success");
      Logger.log(`Unsubscribed (mailto): ${message.getFrom()} -> ${email}`);
      return true;
    }
  } catch (e) {
    Logger.log(`Unsubscribe error for ${messageId}: ${e}`);
  }

  return false;
}

/**
 * Strips accents/diacritics from a string.
 * "clínica" → "clinica", "médico" → "medico"
 */
function stripAccents_(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Protected keywords (Spanish + English) for dynamic detection.
// All stored without accents — matching is accent-insensitive.

const HEALTH_KEYWORDS_ = [
  // Spanish
  "clinica", "hospital", "medic", "doctor", "doctora",
  "salud", "dental", "odontologo", "laboratorio", "farmacia",
  "isapre", "fonasa", "consulta medica", "examen",
  "radiologia", "oftalmolog", "dermatolog", "pediatr",
  "ginecolog", "cardiolog", "neurolog", "traumatolog", "kinesio",
  "nutricion", "psicolog", "psiquiatr", "urgencia",
  "receta", "hora medica", "resultado examen",
  // English
  "clinic", "hospital", "medical", "healthcare", "health care",
  "doctor", "physician", "pharmacy", "dental", "laboratory",
  "diagnosis", "prescription", "appointment",
];

const GOVERNMENT_KEYWORDS_ = [
  // Spanish
  "gobierno", "ministerio", "municipalidad", "municipio",
  "servicio publico", "registro civil", "sii", "tesoreria",
  "contraloria", "intendencia", "gobernacion", "subsecretaria",
  "secretaria", "congreso", "senado", "camara de diputados",
  "poder judicial", "fiscalia", "defensoria", "servel",
  "servicio electoral", "aduanas", "sernac", "sence",
  "serviu", "minvu", "minsal", "mineduc", "mintrab",
  "carabineros", "policia", "investigaciones", "pdi",
  "bomberos", "impuestos internos", "estado", "gob.cl",
  "tributario", "fiscal", "notaria", "conservador de bienes",
  // English
  "government", "ministry", "municipality", "public service",
  "civil registry", "treasury", "congress", "senate",
  "judiciary", "prosecutor", "customs", "electoral",
  "tax authority", "internal revenue", "irs", "federal",
  "state department", "city hall", "county", "dmv",
  "social security", "public defender", "notary public",
];

const IMMIGRATION_KEYWORDS_ = [
  // Spanish
  "migracion", "migraciones", "extranjeria", "visa",
  "residencia", "permanencia definitiva", "permiso de trabajo",
  "refugio", "asilo", "pasaporte", "cedula de identidad",
  "rut", "apostilla", "consulado", "embajada", "legalizacion",
  "nacionalidad", "ciudadania", "deportacion", "expulsion",
  "repatriacion", "frontera", "aduana", "tramite migratorio",
  "permiso de residencia", "tarjeta de residencia",
  // English
  "immigration", "migration", "visa", "residency", "residence permit",
  "work permit", "green card", "asylum", "refugee",
  "passport", "consulate", "embassy", "legalization",
  "citizenship", "naturalization", "deportation", "border",
  "travel document", "entry permit", "immigration status",
  "permanent residence", "temporary residence",
];

const LEGAL_KEYWORDS_ = [
  // Spanish
  "abogado", "abogada", "bufete", "estudio juridico",
  "estudio de abogados", "tribunal", "juzgado", "corte",
  "corte suprema", "corte de apelaciones", "demanda",
  "querella", "juicio", "sentencia", "resolucion judicial",
  "notificacion judicial", "poder notarial", "escritura",
  "contrato", "clausula", "arbitraje", "mediacion",
  "defensor", "defensora", "procurador", "perito",
  "citacion", "comparecencia", "recurso", "apelacion",
  "cautelar", "embargo", "hipoteca", "testamento",
  "herencia", "sucesion", "divorcio", "pension alimenticia",
  "tutela", "curatela", "patente", "marca registrada",
  "propiedad intelectual", "litigio",
  // English
  "attorney", "lawyer", "law firm", "legal", "court",
  "supreme court", "tribunal", "lawsuit", "litigation",
  "subpoena", "summons", "verdict", "ruling", "judgment",
  "deposition", "affidavit", "power of attorney", "notarize",
  "contract", "arbitration", "mediation", "counsel",
  "paralegal", "solicitor", "barrister", "prosecutor",
  "defendant", "plaintiff", "appeal", "injunction",
  "custody", "divorce", "alimony", "child support",
  "probate", "estate", "will", "trust", "trademark",
  "intellectual property", "patent", "copyright",
];

/**
 * Checks if a sender is excluded. Returns the reason string or null.
 */
function getExclusionReason_(message) {
  const from = message.getFrom().toLowerCase();

  // Check hardcoded exclusions
  const hardMatch = CONFIG.EXCLUDED_SENDERS.find((exc) => from.includes(exc));
  if (hardMatch) return `Excluded (${hardMatch})`;

  // Check dynamic exclusions from sheet
  const dynMatch = getDynamicExcluded_().find((exc) => from.includes(exc));
  if (dynMatch) return `Excluded - Sheet (${dynMatch})`;

  // Check protected keywords
  const subject = message.getSubject().toLowerCase();
  const text = stripAccents_(from + " " + subject);

  const healthMatch = HEALTH_KEYWORDS_.find((kw) => text.includes(kw));
  if (healthMatch) return `Health detected (${healthMatch})`;

  const govMatch = GOVERNMENT_KEYWORDS_.find((kw) => text.includes(kw));
  if (govMatch) return `Government detected (${govMatch})`;

  const immMatch = IMMIGRATION_KEYWORDS_.find((kw) => text.includes(kw));
  if (immMatch) return `Immigration detected (${immMatch})`;

  const legalMatch = LEGAL_KEYWORDS_.find((kw) => text.includes(kw));
  if (legalMatch) return `Legal detected (${legalMatch})`;

  return null;
}

/**
 * Checks if a sender is excluded (hardcoded + dynamic from sheet + health detection).
 */
function isExcluded_(message) {
  return getExclusionReason_(message) !== null;
}

/**
 * Detects protected emails (health, government, immigration, legal)
 * by scanning sender name, email, and subject.
 * Accent-insensitive: "Clínica" matches "clinica" and vice versa.
 */
function isProtectedByKeywords_(message) {
  const from = message.getFrom().toLowerCase();
  const subject = message.getSubject().toLowerCase();
  const text = stripAccents_(from + " " + subject);

  return HEALTH_KEYWORDS_.some((kw) => text.includes(kw))
    || GOVERNMENT_KEYWORDS_.some((kw) => text.includes(kw))
    || IMMIGRATION_KEYWORDS_.some((kw) => text.includes(kw))
    || LEGAL_KEYWORDS_.some((kw) => text.includes(kw));
}

/**
 * Checks if a sender is in the "unsubscribe only" list (hardcoded + dynamic).
 */
function isUnsubOnly_(message) {
  const from = message.getFrom().toLowerCase();
  const hardcoded = CONFIG.UNSUBSCRIBE_ONLY_SENDERS.some((exc) => from.includes(exc));
  if (hardcoded) return true;
  return getDynamicUnsubOnly_().some((exc) => from.includes(exc));
}

// Track already-logged protected senders (avoid duplicates per run)
let loggedProtected_ = new Set();

/**
 * Logs a protected sender to the "Protected Senders" sheet tab.
 * Only logs each sender once per run.
 */
function logProtected_(message, reason) {
  const from = message.getFrom();
  if (loggedProtected_.has(from)) return;
  loggedProtected_.add(from);

  const ss = getOrCreateSpreadsheet_();
  let sheet = ss.getSheetByName("Protected Senders");
  if (!sheet) {
    sheet = ss.insertSheet("Protected Senders");
    sheet.appendRow(["Date", "From", "Subject", "Reason"]);
    sheet.getRange("1:1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([new Date(), from, message.getSubject(), reason]);
}

function emptySpam_() {
  let totalDeleted = 0;
  let threads;

  do {
    threads = GmailApp.search("in:spam", 0, CONFIG.BATCH_SIZE);
    for (const thread of threads) {
      Gmail.Users.Threads.remove("me", thread.getId());
      totalDeleted++;
    }
  } while (threads.length === CONFIG.BATCH_SIZE);

  Logger.log(`Spam folder emptied: ${totalDeleted} threads permanently deleted.`);
  return totalDeleted;
}

/**
 * Ensures a sheet tab exists and contains all hardcoded values.
 * Adds missing values without removing user-added entries.
 */
function syncSheetTab_(ss, tabName, hardcodedValues) {
  let sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.getRange("A1").setValue("Sender / Domain");
    sheet.getRange("A1:A1").setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.getRange("A2").setNote("Type one domain or email per row.\nExamples: mybank.com, news@blog.com\nYou can also use commas: a.com, b.com");
  }

  // Read existing values from the sheet
  const lastRow = sheet.getLastRow();
  const existing = new Set();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 1)
      .getValues()
      .flat()
      .forEach((v) => {
        if (v) existing.add(String(v).trim().toLowerCase());
      });
  }

  // Add hardcoded values that aren't already in the sheet
  const toAdd = hardcodedValues.filter((v) => !existing.has(v.toLowerCase()));
  if (toAdd.length > 0) {
    const startRow = Math.max(lastRow + 1, 2);
    const rows = toAdd.map((v) => [v]);
    sheet.getRange(startRow, 1, rows.length, 1).setValues(rows);
    Logger.log(`${tabName}: added ${toAdd.length} new entries.`);
  } else {
    Logger.log(`${tabName}: already up to date.`);
  }
}

function getOrCreateSpreadsheet_() {
  const name = CONFIG.LOG_SPREADSHEET_NAME;
  const files = DriveApp.getFilesByName(name);

  let ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(name);
    const logSheet = ss.getActiveSheet();
    logSheet.setName("Unsubscribe Log");
    logSheet.appendRow(["Date", "From", "Method", "Unsubscribe Target", "Status"]);
    logSheet.getRange("1:1").setFontWeight("bold");
    logSheet.setFrozenRows(1);
  }

  // Rename leftover "Sheet1" to "Unsubscribe Log" if it exists
  const sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1) {
    const logSheet = ss.getSheetByName("Unsubscribe Log");
    if (logSheet) {
      // "Unsubscribe Log" already exists — just delete "Sheet1"
      ss.deleteSheet(sheet1);
    } else {
      // Rename "Sheet1" to "Unsubscribe Log" and set it up
      sheet1.setName("Unsubscribe Log");
      if (sheet1.getLastRow() === 0) {
        sheet1.appendRow(["Date", "From", "Method", "Unsubscribe Target", "Status"]);
        sheet1.getRange("1:1").setFontWeight("bold");
        sheet1.setFrozenRows(1);
      }
    }
  }

  return ss;
}

function getLogSheet_() {
  const ss = getOrCreateSpreadsheet_();
  let sheet = ss.getSheetByName("Unsubscribe Log");
  if (!sheet) {
    sheet = ss.insertSheet("Unsubscribe Log");
    sheet.appendRow(["Date", "From", "Method", "Unsubscribe Target", "Status"]);
    sheet.getRange("1:1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function logUnsubscribe_(from, method, target, status) {
  const sheet = getLogSheet_();
  sheet.appendRow([new Date(), from, method, target, status]);
}

function getOrCreateLabel_(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) {
    label = GmailApp.createLabel(name);
  }
  return label;
}
