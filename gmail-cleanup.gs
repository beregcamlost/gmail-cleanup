// ============================================================
// Gmail Cleanup & Auto-Unsubscribe Script
// ============================================================
// Setup:
//   1. Go to https://script.google.com
//   2. Create a new project
//   3. Paste this entire script
//   4. Run `cleanupInbox` once manually (it will ask for permissions)
//   5. Set up a time-based trigger (optional, for automatic runs)
// ============================================================

const CONFIG = {
  // Max threads to process per run (Apps Script has 6-min execution limit)
  BATCH_SIZE: 500,

  // Delete permanently (true) or just move to trash (false)
  PERMANENT_DELETE: false,

  // Attempt to unsubscribe via List-Unsubscribe headers
  AUTO_UNSUBSCRIBE: true,

  // How old emails must be to get cleaned (in days, 0 = all)
  OLDER_THAN_DAYS: 365,

  // Senders/domains to EXCLUDE from deletion (lowercase, partial match)
  EXCLUDED_SENDERS: ["linkedin.com", "google.com", "anthropic.com"],

  // Additional sender patterns to always delete (lowercase)
  BLOCKED_SENDERS: [
    // Add specific senders here, e.g.:
    // "noreply@somecompany.com",
    // "newsletter@example.com",
  ],

  // Label to mark processed unsubscribe attempts (avoids retrying)
  UNSUBSCRIBED_LABEL: "_unsubscribed",

  // Spreadsheet name for persistent unsubscribe log
  LOG_SPREADSHEET_NAME: "Gmail Cleanup Log",
};

/**
 * Main entry point - cleans promotions, newsletters, and attempts unsubscribe.
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
 * Process a single search query: unsubscribe + delete matching threads.
 */
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

      // Skip excluded senders
      if (isExcluded_(firstMessage)) continue;

      // Attempt unsubscribe before deleting
      if (CONFIG.AUTO_UNSUBSCRIBE) {
        if (tryUnsubscribe_(firstMessage)) {
          unsubscribed++;
        }
      }

      // Delete or trash the thread
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

/**
 * Attempts to unsubscribe using the List-Unsubscribe header.
 * Supports both HTTPS and mailto unsubscribe methods.
 */
function tryUnsubscribe_(message) {
  const messageId = message.getId();
  const unsubLabel = getOrCreateLabel_(CONFIG.UNSUBSCRIBED_LABEL);

  // Skip if already attempted
  const thread = message.getThread();
  const labels = thread.getLabels();
  if (labels.some((l) => l.getName() === CONFIG.UNSUBSCRIBED_LABEL)) {
    return false;
  }

  try {
    // Get raw headers via Gmail API
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

    // Try HTTPS unsubscribe first (preferred - one-click)
    const httpsMatch = value.match(/<(https?:\/\/[^>]+)>/);
    if (httpsMatch) {
      const url = httpsMatch[1];
      const postHeader = headers.find(
        (h) => h.name.toLowerCase() === "list-unsubscribe-post"
      );

      try {
        if (postHeader) {
          // RFC 8058 one-click unsubscribe
          UrlFetchApp.fetch(url, {
            method: "post",
            payload: postHeader.value || "List-Unsubscribe=One-Click",
            muteHttpExceptions: true,
            followRedirects: true,
          });
        } else {
          // GET-based unsubscribe
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

    // Fallback: mailto unsubscribe
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
 * Gets or creates the log spreadsheet and returns the active sheet.
 */
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

/**
 * Logs an unsubscribe action to the spreadsheet.
 */
function logUnsubscribe_(from, method, target, status) {
  const sheet = getLogSheet_();
  sheet.appendRow([new Date(), from, method, target, status]);
}

/**
 * Checks if a message is from an excluded sender.
 */
function isExcluded_(message) {
  const from = message.getFrom().toLowerCase();
  return CONFIG.EXCLUDED_SENDERS.some((exc) => from.includes(exc));
}

/**
 * Gets or creates a Gmail label.
 */
function getOrCreateLabel_(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) {
    label = GmailApp.createLabel(name);
  }
  return label;
}

/**
 * Deletes threads from specific blocked senders.
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
 * Dry run - shows what WOULD be deleted without actually deleting.
 * Run this first to verify the script targets the right emails.
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
 * Sets up automatic daily cleanup trigger.
 */
function setupDailyTrigger() {
  // Remove existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === "cleanupInbox") {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Run daily between 2-3 AM
  ScriptApp.newTrigger("cleanupInbox")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();

  Logger.log("Daily cleanup trigger set for 2-3 AM.");
}
