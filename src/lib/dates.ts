/**
 * Tolerant date parser for the strings ITI renders on the progress page.
 *
 * `new Date("12 Nov 2026")` is not reliable in every JavaScript engine, and a
 * date-only value needs a usable hour before a reminder can be scheduled.
 * Date-only strings therefore resolve to 09:00 local time; `dateText` remains
 * available so the UI can still show exactly what the site wrote.
 */

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/** Fallback hour for a date that carries no time. */
export const DEFAULT_HOUR = 9;

function build(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string | undefined {
  if (!Number.isFinite(year) || year < 2020 || year > 2035) return undefined;
  if (month < 0 || month > 11 || day < 1 || day > 31) return undefined;
  if (hour > 23 || minute > 59) return undefined;

  const date = new Date(year, month, day, hour, minute, 0, 0);
  // Reject impossible dates such as 31 February.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date.toISOString();
}

function timeOf(value: string): { hour: number; minute: number } | undefined {
  const match = value.match(
    /(?:^|[^\d])(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?/i,
  );
  if (!match) return undefined;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3]?.toLowerCase();

  if (suffix === 'pm' && hour < 12) hour += 12;
  if (suffix === 'am' && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return undefined;

  return { hour, minute };
}

/**
 * Parses a human date such as `12 Nov 2026`, `12/11/2026 09:30`,
 * `2026-11-12T09:30:00` or `Session: 12 November 2026`.
 * Day-first order is assumed for slash/dot dates (Egyptian convention).
 */
export function parseDateText(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined;

  const raw = value
    .replace(/\s+/g, ' ')
    .trim()
    .replace(
      /^(?:session|exam|interview|attendance|date|time|when)\s*[:\-]\s*/i,
      '',
    );
  if (!raw) return undefined;

  const time = timeOf(raw);

  let match = raw.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/);
  if (match) {
    return build(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      time?.hour ?? DEFAULT_HOUR,
      time?.minute ?? 0,
    );
  }

  match = raw.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b/);
  if (match) {
    return build(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      time?.hour ?? DEFAULT_HOUR,
      time?.minute ?? 0,
    );
  }

  match = raw.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/);
  if (match) {
    const month = MONTHS[match[2].toLowerCase()];
    return build(
      Number(match[3]),
      month,
      Number(match[1]),
      time?.hour ?? DEFAULT_HOUR,
      time?.minute ?? 0,
    );
  }

  match = raw.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (match) {
    const month = MONTHS[match[1].toLowerCase()];
    return build(
      Number(match[3]),
      month,
      Number(match[2]),
      time?.hour ?? DEFAULT_HOUR,
      time?.minute ?? 0,
    );
  }

  return undefined;
}
