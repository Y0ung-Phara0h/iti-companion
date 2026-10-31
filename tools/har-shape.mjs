#!/usr/bin/env node
/**
 * Turns a Chrome/Edge HAR export into a value-free "shape" of the ITI API.
 *
 * It keeps, for every igateway/OldApi response:
 *   - method, path (numeric/GUID segments replaced with {id}), query KEY names
 *   - response status
 *   - object keys, primitive types, and a marker for date-like strings
 *
 * It deliberately drops every value, header, cookie and query value, so the
 * output contains no names, IDs, tokens or answers. Object keys are field
 * names only.
 *
 * Usage:
 *   node tools/har-shape.mjs session.har
 *   node tools/har-shape.mjs session.har api-shape.json
 *
 * Get the HAR from a DESKTOP browser (the API is identical to the phone's):
 *   1. Open https://internal.iti.gov.eg and sign in.
 *   2. F12 -> Network -> tick "Preserve log" -> clear the list.
 *   3. Open the applicant progress page and each exam/phase detail.
 *   4. Right-click the request list -> "Save all as HAR with content".
 */
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const API = /igateway\.iti\.gov\.eg\/OldApi/i;
const MAX_DEPTH = 8;
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const LOOSE_DATE = /^\d{1,2}[/-]\d{1,2}[/-]\d{4}([ ,]+\d{1,2}:\d{2}.*)?$/;

function shape(value, depth = 0) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) return ['...'];
    return value.length ? [shape(value[0], depth + 1)] : [];
  }
  if (typeof value === 'object') {
    if (depth >= MAX_DEPTH) return '...';
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = shape(value[key], depth + 1);
    }
    return out;
  }
  if (typeof value === 'string') {
    return ISO_DATE.test(value) || LOOSE_DATE.test(value)
      ? 'string(date)'
      : 'string';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return typeof value;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function cleanPath(pathname) {
  return pathname
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '{id}',
    )
    .replace(/\/\d+(?=\/|$)/g, '/{id}');
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node tools/har-shape.mjs <session.har> [api-shape.json]');
  process.exit(1);
}

const har = JSON.parse(await readFile(input, 'utf8'));
const entries = har?.log?.entries ?? [];
const seen = new Map();
let matched = 0;
let withoutBody = 0;

for (const entry of entries) {
  const url = entry?.request?.url ?? '';
  if (!API.test(url)) continue;
  matched += 1;

  let text = entry?.response?.content?.text ?? '';
  if (entry?.response?.content?.encoding === 'base64') {
    text = Buffer.from(text, 'base64').toString('utf8');
  }
  const body = safeJson(text);
  if (body === undefined) {
    withoutBody += 1;
    continue;
  }

  const parsed = new URL(url);
  const path = cleanPath(parsed.pathname);
  const query = [...parsed.searchParams.keys()].sort();
  const key = `${entry.request.method} ${path}${
    query.length ? `?${query.join('&')}` : ''
  }`;

  if (!seen.has(key)) {
    seen.set(key, {
      status: entry.response.status,
      shape: shape(body),
    });
  }
}

const result = Object.fromEntries(
  [...seen.entries()].sort(([a], [b]) => a.localeCompare(b)),
);

if (!Object.keys(result).length) {
  console.error(
    `Found ${matched} ITI API request(s), but none had a JSON response body. ` +
      'Export the HAR with "Save all as HAR with content" and try again.',
  );
  process.exit(2);
}

const output = JSON.stringify(result, null, 2);
const target = process.argv[3];

if (target) {
  await writeFile(target, `${output}\n`, 'utf8');
  console.error(
    `Wrote ${Object.keys(result).length} endpoint shape(s) to ${target}. ` +
      (withoutBody
        ? `${withoutBody} response(s) had no body and were skipped.`
        : 'No values were copied.'),
  );
} else {
  console.log(output);
  if (withoutBody) {
    console.error(`${withoutBody} response(s) had no body and were skipped.`);
  }
}
