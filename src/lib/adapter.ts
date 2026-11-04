import type {
  CapturedPayload,
  ExamSession,
  ProgressItem,
  ScrapedSummary,
  Summary,
} from './types';
import { parseDateText } from './dates';

const DATE_KEYS = [
  'sessionDate',
  'examDate',
  'interviewDate',
  'actionDate',
  'scheduledDate',
  'startDate',
  'startTime',
  'fromDate',
  'date',
];

const LOCATION_KEYS = [
  'locationName',
  'branchName',
  'cityName',
  'trainingLocationName',
  'location',
  'branch',
  'city',
  'trainingLocation',
  'address',
  'venue',
  'place',
];

const TITLE_KEYS = [
  'actionBatchActionName',
  'actionName',
  'actionBatchName',
  'examName',
  'sessionName',
  'nameEn',
  'name',
  'title',
];

const STATUS_KEYS = [
  'attendanceStatusName',
  'attendanceStatus',
  'actionStatusName',
  'actionStatus',
  'actionBatchStatusName',
  'actionBatchStatus',
  'statusName',
  'status',
];

const APPLICANT_NAME_KEYS = [
  'fullName',
  'applicantName',
  'displayName',
  'nameEn',
  'name',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Case-insensitive first-match lookup. */
function read(obj: Record<string, unknown>, keys: string[]): unknown {
  const byLower = new Map<string, string>();
  for (const key of Object.keys(obj)) byLower.set(key.toLowerCase(), key);

  for (const wanted of keys) {
    const key = byLower.get(wanted.toLowerCase());
    if (!key) continue;
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return undefined;
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function isoDate(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  if (typeof value !== 'string') return undefined;

  const normalized = value
    .trim()
    .replace(/^date\s*[:\-]\s*/i, '')
    .replace(/\s+at\s+/i, ' ');
  if (!normalized) return undefined;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;

  // Guard against birth dates and other unrelated fields.
  const year = date.getFullYear();
  if (year < 2024 || year > 2035) return undefined;
  return date.toISOString();
}

function walk(
  value: unknown,
  visit: (obj: Record<string, unknown>) => void,
  depth = 0,
): void {
  if (depth > 10 || value === null || value === undefined) return;

  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit, depth + 1);
    return;
  }
  if (!isRecord(value)) return;

  visit(value);
  for (const child of Object.values(value)) walk(child, visit, depth + 1);
}

function unwrap(body: unknown): unknown {
  if (!isRecord(body)) return body;
  for (const key of ['data', 'result', 'value', 'item']) {
    const inner = body[key];
    if (isRecord(inner) || Array.isArray(inner)) return inner;
  }
  return body;
}

function arrayFrom(body: unknown): unknown[] {
  const unwrapped = unwrap(body);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (isRecord(unwrapped)) {
    for (const key of ['items', 'results', 'data', 'list', 'records']) {
      const value = unwrapped[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

function collectSessions(
  body: unknown,
  fallbackTitle: string | undefined,
): ExamSession[] {
  const found = new Map<string, ExamSession>();

  walk(body, obj => {
    const rawDate = read(obj, DATE_KEYS);
    const startsAt = isoDate(rawDate);
    const dateText = text(rawDate);
    if (!startsAt && !dateText) return;

    const title =
      text(read(obj, TITLE_KEYS)) ?? fallbackTitle ?? 'Exam session';
    const location = text(read(obj, LOCATION_KEYS));
    const status = text(read(obj, STATUS_KEYS));

    // Avoid turning unrelated date fields into cards.
    const context = `${title} ${status ?? ''}`;
    if (!/exam|interview|session|track|acceptance/i.test(context)) return;

    const key = `${title}|${startsAt ?? dateText}`;
    if (found.has(key)) return;

    found.set(key, {
      id: key,
      title,
      startsAt,
      dateText,
      location,
      status,
    });
  });

  return [...found.values()].slice(0, 20);
}

/**
 * Merges one captured API response into the cached summary.
 *
 * The exact ITI payload shapes are not documented; this adapter is deliberately
 * tolerant. It only fills a field when the value is unambiguous, so an unknown
 * response never overwrites good data with noise.
 */
export function mergeSummary(
  previous: Summary | null,
  payload: CapturedPayload,
): Summary {
  const summary: Summary = previous
    ? {
        ...previous,
        sessions: [...previous.sessions],
        progress: [...previous.progress],
      }
    : { sessions: [], progress: [], updatedAt: 0 };

  const { url, body } = payload;

  if (/GetApplicantByUser/i.test(url)) {
    const root = unwrap(body);
    if (isRecord(root)) {
      const id = text(read(root, ['applicantId', 'id']));
      const name = text(read(root, APPLICANT_NAME_KEYS));
      if (id) summary.applicantId = id;
      if (name) summary.applicantName = name;
    }
  }

  if (/FilterApplicantActionBatches/i.test(url)) {
    const next: ProgressItem[] = [];

    for (const item of arrayFrom(body)) {
      if (!isRecord(item)) continue;

      const name = text(
        read(item, ['actionBatchName', 'nameEn', 'name', 'title']),
      );
      if (!name) continue;

      const status = text(read(item, STATUS_KEYS));
      const flag = read(item, ['isActive', 'active', 'isCurrent']);
      const active =
        flag === true ||
        (status ? /assigned|in.?progress|current/i.test(status) : false);

      if (!next.some(entry => entry.name === name)) {
        next.push({ name, status, active });
      }
    }

    if (next.length) {
      summary.progress = next.slice(0, 12);
      const active = next.find(entry => entry.active);
      if (active) {
        summary.phase = active.name;
        summary.phaseStatus = active.status ?? 'Assigned';
      }
    }
  }

  if (/GetApplicantActionBatchDetails/i.test(url)) {
    const root = unwrap(body);
    if (isRecord(root)) {
      const name = text(
        read(root, ['actionBatchName', 'nameEn', 'name', 'title']),
      );
      const note = text(read(root, ['note', 'description', 'instructions']));
      const status = text(read(root, STATUS_KEYS));

      if (name && (!summary.phase || summary.phase === name)) {
        summary.phase = name;
        if (status) summary.phaseStatus = status;
        if (note) summary.phaseNote = note;
      }
    }
  }

  if (/(ApplicantActionBatch|Examinations|Interview)/i.test(url)) {
    const sessions = collectSessions(body, summary.phase);
    if (sessions.length) summary.sessions = sessions;
  }

  summary.updatedAt = Date.now();
  return summary;
}

/* ------------------------------------------------------------- DOM scrape */

function scrapedText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed.length ? trimmed : undefined;
}

function scrapedProgress(value: unknown): ProgressItem[] {
  if (!Array.isArray(value)) return [];
  const items: ProgressItem[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const name = scrapedText(entry.name);
    if (!name) continue;
    if (items.some(item => item.name === name)) continue;

    items.push({
      name,
      status: scrapedText(entry.status),
      active: entry.active === true,
    });
  }

  return items.slice(0, 12);
}

/**
 * The injected script is untrusted input: validate and normalise it here so a
 * malformed or hostile message can never reach the renderer as a Summary.
 */
export function normalizeScraped(raw: unknown): ScrapedSummary {
  if (!isRecord(raw)) return {};

  const scraped: ScrapedSummary = {};
  const href = scrapedText(raw.href);
  const applicantName = scrapedText(raw.applicantName);
  const phase = scrapedText(raw.phase);
  const phaseStatus = scrapedText(raw.phaseStatus);
  const phaseNote = scrapedText(raw.phaseNote);
  const progress = scrapedProgress(raw.progress);

  if (href) scraped.href = href;
  if (applicantName) scraped.applicantName = applicantName;
  if (phase) scraped.phase = phase;
  if (phaseStatus) scraped.phaseStatus = phaseStatus;
  if (phaseNote) scraped.phaseNote = phaseNote.slice(0, 400);
  if (progress.length) scraped.progress = progress;

  if (Array.isArray(raw.sessions)) {
    const sessions: NonNullable<ScrapedSummary['sessions']> = [];

    for (const entry of raw.sessions) {
      if (!isRecord(entry)) continue;
      const title = scrapedText(entry.title);
      if (!title) continue;
      if (sessions.some(session => session.title === title)) continue;

      sessions.push({
        title,
        dateText: scrapedText(entry.dateText)?.slice(0, 120),
        location: scrapedText(entry.location)?.slice(0, 160),
        status: scrapedText(entry.status)?.slice(0, 60),
      });
    }

    if (sessions.length) scraped.sessions = sessions.slice(0, 20);
  }

  return scraped;
}

export function hasScrapedData(scraped: ScrapedSummary): boolean {
  return Boolean(
    scraped.phase ||
      scraped.phaseNote ||
      scraped.applicantName ||
      scraped.sessions?.length ||
      scraped.progress?.length,
  );
}

function sessionsFromScraped(scraped: ScrapedSummary): ExamSession[] {
  return (scraped.sessions ?? []).map((session, index) => {
    const startsAt = parseDateText(session.dateText);

    return {
      id: `${session.title}|${session.dateText ?? index}`,
      title: session.title,
      startsAt,
      dateText: session.dateText,
      location: session.location,
      status: session.status,
    };
  });
}

/**
 * Merges a DOM snapshot into the cached summary. Returns `null` when the page
 * contained nothing useful, so the caller can keep the previous value.
 */
export function mergeScraped(
  previous: Summary | null,
  raw: unknown,
): Summary | null {
  const scraped = normalizeScraped(raw);
  if (!hasScrapedData(scraped)) return null;

  const summary: Summary = previous
    ? {
        ...previous,
        sessions: [...previous.sessions],
        progress: [...previous.progress],
      }
    : { sessions: [], progress: [], updatedAt: 0 };

  if (scraped.applicantName) summary.applicantName = scraped.applicantName;

  const phaseChanged = Boolean(scraped.phase && scraped.phase !== previous?.phase);

  if (scraped.phase) summary.phase = scraped.phase;
  if (scraped.phaseStatus) summary.phaseStatus = scraped.phaseStatus;
  else if (phaseChanged) summary.phaseStatus = undefined;
  if (scraped.phaseNote) summary.phaseNote = scraped.phaseNote;
  else if (phaseChanged) summary.phaseNote = undefined;
  if (scraped.progress?.length) summary.progress = scraped.progress;

  const active = scraped.progress?.find(item => item.active);
  if (active && !scraped.phase) summary.phase = active.name;
  if (active?.status && !scraped.phaseStatus) summary.phaseStatus = active.status;

  // The visible progress page is authoritative for sessions: it shows the
  // actions of the phase the applicant is actually in.
  if (scraped.sessions?.length) {
    summary.sessions = sessionsFromScraped(scraped);
  } else if (phaseChanged) {
    // A different phase with no dated action yet: old sessions would lie.
    summary.sessions = [];
  }

  summary.updatedAt = Date.now();
  return summary;
}
