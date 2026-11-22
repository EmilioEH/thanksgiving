// Time arithmetic for the plan. Pure functions — no DOM, no clock of its own —
// so they can be tested under Node.

import { THANKSGIVING } from './data.js';

/** Local Date for `at` minutes relative to dinner on Thanksgiving. */
export function stepTime(dinner, shift, at, day = THANKSGIVING) {
  const [y, m, d] = day.split('-').map(Number);
  const [hh, mm] = dinner.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm + at + (shift || 0), 0, 0);
}

export function formatClock(date) {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

/** "in 25 min", "in 1 h 5 min", "now", "12 min ago". */
export function relative(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes === 0) return 'now';
  const abs = Math.abs(minutes);
  const text = abs >= 60 ? `${Math.floor(abs / 60)} h${abs % 60 ? ` ${abs % 60} min` : ''}` : `${abs} min`;
  return minutes > 0 ? `in ${text}` : `${text} ago`;
}

/** mm:ss (or h:mm:ss) countdown; negative values read as overtime. */
export function countdown(ms) {
  const over = ms < 0;
  let s = Math.ceil(Math.abs(ms) / 1000);
  if (over) s = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  const body = h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
  return over ? `+${body}` : body;
}

/**
 * Lay out the day: each step with its clock time and status.
 * `current` is the earliest step that is due and not done; `next` the first
 * one not yet due.
 */
export function layoutDay(steps, { dinner, shift, checks }, now) {
  const rows = steps.map((step) => {
    const time = stepTime(dinner, shift, step.at);
    const done = !!checks[step.id];
    return { step, time, done, due: time.getTime() <= now };
  });
  const current = rows.find((r) => r.due && !r.done) || null;
  const next = rows.find((r) => !r.due && !r.done) || null;
  return { rows, current, next };
}

/** Which page to open by default, given today's date. */
export function defaultTab(now) {
  const d = new Date(now);
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return today === THANKSGIVING ? 'today' : today < THANKSGIVING ? 'prep' : 'today';
}

export const isoDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
