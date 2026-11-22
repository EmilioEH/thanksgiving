// Two phones on one plan, against `wrangler dev` (start it first: npm run dev).
//   node tests/e2e.mjs [baseUrl]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8787';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '.out');
fs.mkdirSync(OUT, { recursive: true });
const executablePath = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;

let failures = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? '  ok  ' : '  FAIL'}  ${label}${!ok && detail ? `  — ${detail}` : ''}`);
};
const until = async (fn, ms = 8000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
};

const browser = await chromium.launch({ executablePath });
const errors = [];
const phone = async (device, extra = {}) => {
  const context = await browser.newContext({ ...devices[device], timezoneId: 'America/New_York', ...extra });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${device}: ${e}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${device}: ${m.text()}`));
  return { context, page };
};

try {
  console.log('\nBefore Thursday (Sunday 22 Nov, 10 AM)');
  const sunday = new Date('2026-11-22T15:00:00Z');
  const a = await phone('iPhone 13');
  await a.page.clock.install({ time: sunday });
  await a.page.goto(BASE);
  await a.page.click('#startBtn');
  await a.page.waitForURL(/\/k\/[A-Za-z0-9_-]{22}/);
  const link = a.page.url().split('#')[0];
  check(true, `new plan created: ${link.replace(BASE, '')}`);
  await a.page.waitForSelector('.day.is-today');
  check((await a.page.textContent('.day.is-today h2')).includes('Sunday'), 'opens on the Before tab with Sunday highlighted');
  await a.page.screenshot({ path: path.join(OUT, '1-before.png'), fullPage: false });

  const b = await phone('Pixel 7');
  await b.page.clock.install({ time: sunday });
  await b.page.goto(link + '#shop');
  await b.page.waitForSelector('.shop');
  await a.page.click('a[href="#shop"]');
  await a.page.check('input[data-check="shop"][data-id="turkey"]');
  check(await until(() => b.page.isChecked('input[data-check="shop"][data-id="turkey"]')), 'a tick on one phone shows on the other within seconds');
  await b.page.uncheck('input[data-check="shop"][data-id="turkey"]');
  check(await until(async () => !(await a.page.isChecked('input[data-check="shop"][data-id="turkey"]'))), 'and back the other way');
  await a.page.screenshot({ path: path.join(OUT, '2-shopping.png') });

  await a.page.goto(link); // remembered link opens again
  await a.page.goto(BASE);
  await a.page.waitForURL(/\/k\//);
  check(a.page.url().startsWith(link), 'opening the bare address goes back to the same plan');

  console.log('\nThursday 26 Nov, 12:05 PM — turkey time');
  for (const p of [a, b]) {
    await p.context.close();
  }
  const c = await phone('iPhone 13');
  const d = await phone('Pixel 7');
  const thursday = new Date('2026-11-26T17:05:20Z'); // 12:05:20 PM New York
  for (const p of [c, d]) {
    await p.page.clock.install({ time: thursday });
    await p.page.goto(link);
  }
  await c.page.waitForSelector('#alarm:not([hidden])', { timeout: 8000 }).catch(() => {});
  check(await c.page.isVisible('#alarm'), 'the due step raises an alarm');
  check((await c.page.textContent('#alarmTitle')).includes('Turkey and stuffing into the oven'), 'alarm names the step', await c.page.textContent('#alarmTitle'));
  await c.page.screenshot({ path: path.join(OUT, '3-alarm.png') });
  await c.page.click('#alarmDone');
  check(await until(async () => !(await d.page.isVisible('#alarm'))), 'marking it done clears the alarm on the other phone too');
  check(await until(() => d.page.isChecked('input[data-check="day"][data-id="turkey-in"]')), 'and ticks the step there');

  await c.page.click('#step-turkey-in button[data-timer]');
  check(await until(async () => (await d.page.locator('.timer').count()) === 1), 'a timer started on one phone runs on both');
  const label = await d.page.textContent('.timer-label');
  check(/Turkey and stuffing/.test(label), 'timer is labelled with the step', label);
  await c.page.screenshot({ path: path.join(OUT, '4-thursday.png') });

  await c.page.click('button[data-shift="10"]');
  check(await until(async () => (await d.page.textContent('#step-dinner .time')).includes('2:10 PM')), 'running late +10 min moves dinner for everyone');
  await c.page.click('button[data-shift="reset"]');

  console.log('\nTimer runs out');
  await c.page.clock.fastForward('01:10:05');
  await d.page.clock.fastForward('01:10:05');
  await c.page.waitForSelector('#alarm:not([hidden])', { timeout: 8000 }).catch(() => {});
  const ringing = (await c.page.textContent('#alarmTitle')) || '';
  check(/⏱|Check the turkey/.test(ringing), 'an alarm rings when the timer ends', ringing);

  console.log('\nRecipe page');
  await d.page.goto(link + '#recipe/turkey/roast');
  await d.page.waitForSelector('#r-roast.is-focus');
  check(true, 'a step link opens the recipe at that step');
  await d.page.screenshot({ path: path.join(OUT, '5-recipe.png') });

  const noScroll = await d.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  check(noScroll, 'no sideways scrolling at phone width');
} finally {
  await browser.close();
}

check(errors.length === 0, 'no errors in the browser console', errors.slice(0, 3).join(' | '));
console.log(`\n${failures ? `${failures} check(s) FAILED` : 'All checks passed'}\n`);
process.exit(failures ? 1 : 0);
