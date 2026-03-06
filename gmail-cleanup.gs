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
const CLEANUP_OLDER_THAN_UNIT = "years"; // "days", "months", or "years"

// Should the script try to unsubscribe you from mailing lists?
// true  = yes, unsubscribe before deleting
// false = no, just delete without unsubscribing
const CLEANUP_AUTO_UNSUBSCRIBE = true;

// Domains or senders you want to KEEP (never delete).
// Add any email address or domain you want to protect.
// Example: "amazon.com" will protect ALL emails from Amazon.
const CLEANUP_EXCLUDED_SENDERS = [
  "linkedin.com",
  "google.com",
  "anthropic.com",
  // Add more here, e.g.:
  // "amazon.com",
  // "mybank.com",
  // "mom@gmail.com",
];

// Senders you ALWAYS want deleted, no matter what.
// Leave empty [] if you don't have any.
const CLEANUP_BLOCKED_SENDERS = [
  // "noreply@spammy-company.com",
  // "deals@annoying-store.com",
];

// ── Delete All Settings (used by "deleteAllEmails") ────────
//    WARNING: This deletes ALL emails, not just promotions!
//    Use this for a full inbox wipe with your own filters.

// How old must an email be before it gets deleted?
// Set the number and the unit ("days", "months", or "years").
const DELETE_ALL_OLDER_THAN = 1;
const DELETE_ALL_OLDER_THAN_UNIT = "years"; // "days", "months", or "years"

// Domains or senders you want to KEEP when deleting everything.
const DELETE_ALL_EXCLUDED_SENDERS = [
  "linkedin.com",
  "google.com",
  "anthropic.com",
  // Add more here, e.g.:
  // "work-email.com",
  // "important-sender@example.com",
];

// ── General Settings ───────────────────────────────────────

// What happens to deleted emails?
// false = move to Trash (you can recover them for 30 days)
// true  = delete permanently (cannot be recovered!)
const PERMANENT_DELETE = false;

// Name of the Google Sheet where unsubscribe actions are logged.
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
  EXCLUDED_SENDERS: CLEANUP_EXCLUDED_SENDERS,
  BLOCKED_SENDERS: CLEANUP_BLOCKED_SENDERS,
  UNSUBSCRIBED_LABEL: "_unsubscribed",
  LOG_SPREADSHEET_NAME: LOG_SPREADSHEET_NAME,
};

const DELETE_ALL_OPTIONS = {
  OLDER_THAN_DAYS: toDays_(DELETE_ALL_OLDER_THAN, DELETE_ALL_OLDER_THAN_UNIT),
  EXCLUDED_SENDERS: DELETE_ALL_EXCLUDED_SENDERS,
  PERMANENT_DELETE: PERMANENT_DELETE,
};

/**
 * Main cleanup — deletes promotions, newsletters, and marketing emails.
 * Also unsubscribes you from mailing lists if enabled.
 */
function cleanupInbox() {
  const queries = [
    "category:promotions",
    "label:^unsub OR subject:(unsubscribe OR newsletter OR digest OR weekly OR bulletin)",
    'from:(noreply OR no-reply OR newsletter OR marketing OR promo OR info@ OR news@)',
  ];

  let totalDeleted = 0;
  let totalUnsubscribed = 0;

  for (const query of queries) {
    const result = processQuery_(query);
    totalDeleted += result.deleted;
    totalUnsubscribed += result.unsubscribed;
  }

  Logger.log(
    `Done. Deleted: ${totalDeleted} threads, Unsubscribed: ${totalUnsubscribed} senders.`
  );
}

/**
 * Preview mode — shows what cleanupInbox would delete without actually deleting.
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
      if (isExcluded_(msg)) continue;
      seen.add(id);

      Logger.log(`[WOULD DELETE] From: ${msg.getFrom()} | Subject: ${msg.getSubject()}`);
    }
  }

  Logger.log(`\nTotal unique threads that would be affected: ${seen.size}`);
  Logger.log("Run cleanupInbox() to actually delete them.");
}

/**
 * Nuclear option — deletes ALL emails from your inbox.
 * Respects DELETE_ALL_OLDER_THAN_DAYS and DELETE_ALL_EXCLUDED_SENDERS.
 */
function deleteAllEmails() {
  const opts = DELETE_ALL_OPTIONS;
  const olderThan = opts.OLDER_THAN_DAYS > 0 ? ` older_than:${opts.OLDER_THAN_DAYS}d` : "";
  const query = `in:inbox${olderThan}`;

  let totalDeleted = 0;
  let totalSkipped = 0;
  let threads;

  do {
    threads = GmailApp.search(query, 0, CONFIG.BATCH_SIZE);

    for (const thread of threads) {
      const from = thread.getMessages()[0].getFrom().toLowerCase();
      const excluded = opts.EXCLUDED_SENDERS.some((exc) => from.includes(exc));

      if (excluded) {
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
  const opts = DELETE_ALL_OPTIONS;
  const olderThan = opts.OLDER_THAN_DAYS > 0 ? ` older_than:${opts.OLDER_THAN_DAYS}d` : "";
  const query = `in:inbox${olderThan}`;

  const threads = GmailApp.search(query, 0, 50);
  let count = 0;
  let skipped = 0;

  for (const thread of threads) {
    const msg = thread.getMessages()[0];
    const from = msg.getFrom().toLowerCase();
    const excluded = opts.EXCLUDED_SENDERS.some((exc) => from.includes(exc));

    if (excluded) {
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
  let threads;

  do {
    threads = GmailApp.search(fullQuery, 0, CONFIG.BATCH_SIZE);

    for (const thread of threads) {
      const messages = thread.getMessages();
      const firstMessage = messages[0];

      if (isExcluded_(firstMessage)) continue;

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

  return { deleted, unsubscribed };
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

function getLogSheet_() {
  const name = CONFIG.LOG_SPREADSHEET_NAME;
  const files = DriveApp.getFilesByName(name);

  let ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(name);
    const sheet = ss.getActiveSheet();
    sheet.appendRow(["Date", "From", "Method", "Unsubscribe Target", "Status"]);
    sheet.getRange("1:1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return ss.getActiveSheet();
}

function logUnsubscribe_(from, method, target, status) {
  const sheet = getLogSheet_();
  sheet.appendRow([new Date(), from, method, target, status]);
}

function isExcluded_(message) {
  const from = message.getFrom().toLowerCase();
  return CONFIG.EXCLUDED_SENDERS.some((exc) => from.includes(exc));
}

function getOrCreateLabel_(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) {
    label = GmailApp.createLabel(name);
  }
  return label;
}
