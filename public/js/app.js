// The app: shared state sync, four views, timers and alarms.

import { RECIPES, PREP, SHOPPING, SHOP_SECTIONS, DAY, THANKSGIVING, DEFAULT_DINNER } from './data.js';
import { stepTime, formatClock, relative, countdown, layoutDay, defaultTab, isoDay } from './plan.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode: fine, just not remembered */
    }
  },
};

// ---------------------------------------------------------------- routing

const path = location.pathname.match(/^\/k\/([A-Za-z0-9_-]{22})\/?$/);
const KITCHEN = path ? path[1] : null;


function showLanding() {
  document.body.classList.add('landing-mode');
  $('#landing').hidden = false;
  $('#startBtn').addEventListener('click', async () => {
    $('#startBtn').disabled = true;
    $('#startBtn').textContent = 'Setting up…';
    try {
      const res = await fetch('/api/new', { method: 'POST' });
      const { id } = await res.json();
      location.href = `/k/${id}#prep`;
    } catch {
      $('#startBtn').disabled = false;
      $('#startBtn').textContent = 'Start our Thanksgiving';
      $('#landingError').hidden = false;
    }
  });
}

// ---------------------------------------------------------------- state

let state = { v: -1, dinner: DEFAULT_DINNER, shift: 0, checks: { day: {}, prep: {}, shop: {} }, timers: [] };
let skew = 0; // server clock minus this phone's clock
let online = true;
const now = () => Date.now() + skew;

async function pull() {
  try {
    const res = await fetch(`/api/k/${KITCHEN}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    accept(await res.json());
    setOnline(true);
  } catch {
    setOnline(false);
  }
}

async function send(op) {
  try {
    const res = await fetch(`/api/k/${KITCHEN}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(op),
    });
    if (!res.ok) throw new Error(res.status);
    accept(await res.json());
    setOnline(true);
  } catch {
    setOnline(false);
    pull(); // undo the optimistic change if it didn't land
  }
}

function accept(next) {
  // Correct small clock differences between phones so a shared timer ends at
  // the same moment everywhere. A huge difference means this phone's clock or
  // time zone is set deliberately; trust it rather than jump the plan around.
  if (typeof next.now === 'number') {
    const diff = next.now - Date.now();
    skew = Math.abs(diff) < 5 * 60000 ? diff : 0;
  }
  const changed = next.v !== state.v;
  state = next;
  if (changed) render();
}

function setOnline(value) {
  if (online === value) return;
  online = value;
  $('#offline').hidden = value;
}

/** Apply a change locally at once, then tell the server. */
function change(op, local) {
  local(state);
  render();
  send(op);
}

const toggle = (list, id, done) =>
  change({ type: 'check', list, id, done }, (s) => {
    if (done) s.checks[list][id] = now();
    else delete s.checks[list][id];
  });

function startTimer(label, minutes, step) {
  unlockAudio();
  const end = now() + minutes * 60000;
  change({ type: 'timer', label, minutes, step, end }, (s) => {
    s.timers = [...s.timers, { id: `tmp${Math.random().toString(36).slice(2, 8)}`, label, step, end }];
  });
}

const cancelTimer = (id) => change({ type: 'timerCancel', id }, (s) => (s.timers = s.timers.filter((t) => t.id !== id)));

// ---------------------------------------------------------------- views

const TABS = ['today', 'prep', 'shop', 'recipes'];
let route = { tab: 'today', recipe: null, step: null };

function readRoute() {
  const [tab, recipe, step] = location.hash.replace(/^#/, '').split('/');
  if (tab === 'recipe' && RECIPES.some((r) => r.id === recipe)) route = { tab: 'recipes', recipe, step: step || null };
  else route = { tab: TABS.includes(tab) ? tab : defaultTab(now()), recipe: null, step: null };
}

function render() {
  if (!KITCHEN) return;
  document.querySelectorAll('[data-tab]').forEach((a) => a.setAttribute('aria-current', a.dataset.tab === route.tab ? 'page' : 'false'));
  const view = $('#view');
  if (route.tab === 'today') view.innerHTML = viewToday();
  else if (route.tab === 'prep') view.innerHTML = viewPrep();
  else if (route.tab === 'shop') view.innerHTML = viewShop();
  else if (route.recipe) view.innerHTML = viewRecipe(RECIPES.find((r) => r.id === route.recipe));
  else view.innerHTML = viewRecipeList();
  $('#dinnerChip').textContent = `Dinner ${formatClock(stepTime(state.dinner, 0, 0))}`;
  renderTimers();
  tick();
}

const isThanksgiving = () => isoDay(new Date(now())) === THANKSGIVING;
const recipeLink = (recipe, step) => (recipe ? `<a class="btn btn-small" href="#recipe/${recipe}${step ? `/${step}` : ''}">Recipe</a>` : '');
const timerButton = (label, minutes, step) =>
  minutes ? `<button class="btn btn-small" data-timer="${minutes}" data-label="${esc(label)}" data-step="${esc(step || '')}">⏱ ${minutes} min</button>` : '';

function viewToday() {
  const t = now();
  const { rows, current, next } = layoutDay(DAY, { dinner: state.dinner, shift: state.shift, checks: state.checks.day }, t);
  const thursday = isThanksgiving();
  const done = rows.filter((r) => r.done).length;
  const hideDone = store.get('tg.hideDone', false);

  const focus = thursday ? current || next : null;
  let hero = '';
  if (!thursday) {
    hero = `<div class="card note"><strong>This is Thursday’s plan.</strong> Times are worked back from dinner at ${esc(formatClock(stepTime(state.dinner, 0, 0)))}. Alarms only go off on Thursday. Before then, use the <a href="#prep">Before</a> list.</div>`;
  } else if (focus) {
    const late = focus.due;
    hero = `<section class="card hero ${late ? 'hero-now' : ''}">
      <p class="eyebrow">${late ? 'Do now' : 'Up next'} · <span data-rel="${focus.time.getTime()}"></span></p>
      <h2>${esc(focus.step.title)}</h2>
      <p>${esc(focus.step.text)}</p>
      <div class="row">
        <button class="btn btn-primary" data-check="day" data-id="${focus.step.id}" data-done="1">✓ Done</button>
        ${timerButton(focus.step.title, focus.step.timer, focus.step.id)}
        ${recipeLink(focus.step.recipe, focus.step.step)}
      </div>
      ${late && next ? `<p class="muted small">Then at ${esc(formatClock(next.time))}: ${esc(next.step.title)}</p>` : ''}
    </section>`;
  } else if (rows.every((r) => r.done)) {
    hero = `<section class="card hero"><h2>All done. Happy Thanksgiving!</h2></section>`;
  }

  const controls = `<section class="card controls">
    <label class="inline">Dinner at <input id="dinnerInput" type="time" value="${esc(state.dinner)}" step="300"></label>
    <div class="shift">
      <span>Running late?</span>
      <button class="btn btn-small" data-shift="5">+5 min</button>
      <button class="btn btn-small" data-shift="10">+10 min</button>
      <button class="btn btn-small" data-shift="-5">−5 min</button>
      ${state.shift ? `<button class="btn btn-small btn-quiet" data-shift="reset">Back on plan</button>` : ''}
    </div>
    ${state.shift ? `<p class="small warn">Everything is shifted ${state.shift > 0 ? 'later' : 'earlier'} by ${Math.abs(state.shift)} min — dinner now ${esc(formatClock(stepTime(state.dinner, state.shift, 0)))}.</p>` : ''}
    ${thursday && !audioReady ? `<button class="btn btn-alert" id="enableSound">🔔 Turn on alarm sound for this phone</button>` : ''}
  </section>`;

  const list = rows
    .filter((r) => !(hideDone && r.done))
    .map((r) => {
      const isFocus = focus && r.step.id === focus.step.id;
      return `<li class="step ${r.done ? 'is-done' : ''} ${isFocus ? 'is-focus' : ''} ${thursday && r.due && !r.done ? 'is-late' : ''}" id="step-${r.step.id}">
        <label class="tick"><input type="checkbox" data-check="day" data-id="${r.step.id}" ${r.done ? 'checked' : ''}><span class="sr-only">Done</span></label>
        <div class="step-body">
          <p class="time">${esc(formatClock(r.time))}${r.step.alarm ? ' <span title="Alarm" aria-label="alarm">🔔</span>' : ''}</p>
          <h3>${esc(r.step.title)}</h3>
          <p class="text">${esc(r.step.text)}</p>
          <div class="row">${timerButton(r.step.title, r.step.timer, r.step.id)}${recipeLink(r.step.recipe, r.step.step)}</div>
        </div>
      </li>`;
    })
    .join('');

  return `${hero}${controls}
    <div class="list-head"><h2>Thursday</h2><span class="muted">${done}/${rows.length} done</span>
      <label class="inline small"><input type="checkbox" id="hideDone" ${hideDone ? 'checked' : ''}> Hide done</label></div>
    <ol class="steps">${list}</ol>
    <p class="muted small reset-line"><button class="linkish" data-reset="day">Untick all of Thursday</button></p>`;
}

function viewPrep() {
  const today = isoDay(new Date(now()));
  const days = PREP.map((day) => {
    const open = day.tasks.filter((t) => !state.checks.prep[t.id]).length;
    const past = day.date < today;
    const isToday = day.date === today;
    const items = day.tasks
      .map((task) => {
        const done = !!state.checks.prep[task.id];
        const link = task.recipe
          ? `<a class="btn btn-small" href="#recipe/${task.recipe}${task.step ? `/${task.step}` : ''}">Recipe</a>`
          : task.link
            ? `<a class="btn btn-small" href="#${task.link}">Open list</a>`
            : '';
        return `<li class="step ${done ? 'is-done' : ''}">
          <label class="tick"><input type="checkbox" data-check="prep" data-id="${task.id}" ${done ? 'checked' : ''}><span class="sr-only">Done</span></label>
          <div class="step-body"><h3>${esc(task.title)}</h3><p class="text">${esc(task.text)}</p>${link ? `<div class="row">${link}</div>` : ''}</div>
        </li>`;
      })
      .join('');
    const badge = isToday ? '<span class="badge">Today</span>' : past && open ? `<span class="badge badge-warn">${open} still to do</span>` : '';
    return `<section class="day ${isToday ? 'is-today' : ''}"><div class="list-head"><h2>${day.label} <span class="muted">${shortDate(day.date)}</span></h2>${badge}</div><ol class="steps">${items}</ol></section>`;
  });
  const thursday = `<section class="day"><div class="list-head"><h2>Thursday <span class="muted">${shortDate(THANKSGIVING)}</span></h2></div>
    <p class="card note">The cooking day has its own timeline with alarms: <a href="#today">open Thursday</a>.</p></section>`;
  return days.join('') + thursday;
}

function shortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function viewShop() {
  const hide = store.get('tg.hideBought', false);
  const total = SHOPPING.length;
  const got = SHOPPING.filter((i) => state.checks.shop[i.id]).length;
  const sections = SHOP_SECTIONS.map((section) => {
    const items = SHOPPING.filter((i) => i.section === section && !(hide && state.checks.shop[i.id]));
    if (!items.length) return '';
    return `<section><h2 class="section-title">${esc(section)}</h2><ul class="shop">${items
      .map((i) => {
        const done = !!state.checks.shop[i.id];
        return `<li class="${done ? 'is-done' : ''}"><label>
          <input type="checkbox" data-check="shop" data-id="${i.id}" ${done ? 'checked' : ''}>
          <span><strong>${esc(i.name)}</strong>${i.staple ? ' <span class="tag">probably have</span>' : ''}${i.note ? `<span class="muted small block">${esc(i.note)}</span>` : ''}</span>
        </label></li>`;
      })
      .join('')}</ul></section>`;
  }).join('');
  return `<div class="list-head"><h2>Shopping</h2><span class="muted">${got}/${total} got or have</span>
      <label class="inline small"><input type="checkbox" id="hideBought" ${hide ? 'checked' : ''}> Hide ticked</label></div>
    <p class="muted small">Tick anything you’ve bought or already have. Everyone with the link sees the same list.</p>
    ${sections || '<p class="card note">Everything is ticked off. 🎉</p>'}
    <p class="muted small reset-line"><button class="linkish" data-reset="shop">Untick the whole list</button></p>`;
}

function viewRecipeList() {
  return `<div class="list-head"><h2>Recipes</h2></div><ul class="recipe-list">${RECIPES.map(
    (r) => `<li><a class="card recipe-card" href="#recipe/${r.id}"><strong>${esc(r.title)}</strong><span class="muted small">${esc(r.meta)}</span></a></li>`,
  ).join('')}</ul>`;
}

function viewRecipe(recipe) {
  const ticked = store.get(`tg.ing.${recipe.id}`, {});
  const ingredients = recipe.ingredients
    .map(
      (g, gi) =>
        `${g.group ? `<h3>${esc(g.group)}</h3>` : ''}<ul class="ingredients">${g.items
          .map((item, ii) => {
            const key = `${gi}-${ii}`;
            return `<li><label><input type="checkbox" data-ing="${recipe.id}" data-key="${key}" ${ticked[key] ? 'checked' : ''}> <span>${esc(item)}</span></label></li>`;
          })
          .join('')}</ul>`,
    )
    .join('');
  const steps = recipe.steps
    .map(
      (s, i) => `<li class="rstep ${route.step === s.id ? 'is-focus' : ''}" id="r-${s.id}">
        <p class="eyebrow">Step ${i + 1}</p><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
        ${s.timer ? `<div class="row">${timerButton(`${recipe.title.split(' ').slice(0, 3).join(' ')}: ${s.title}`, s.timer, null)}</div>` : ''}
      </li>`,
    )
    .join('');
  return `<p><a href="#recipes" class="linkish">← All recipes</a></p>
    <article class="recipe cooking">
      <h2>${esc(recipe.title)}</h2>
      <p class="muted small">${esc(recipe.source)} · ${esc(recipe.meta)}</p>
      <section class="card"><h3 class="section-title">Ingredients</h3><p class="muted small">Tick as you measure (on this phone only).</p>${ingredients}</section>
      <ol class="rsteps">${steps}</ol>
    </article>`;
}

// ---------------------------------------------------------------- timers bar

function renderTimers() {
  const bar = $('#timers');
  const t = now();
  const live = state.timers.filter((x) => x.end > t - 30 * 60000).sort((a, b) => a.end - b.end);
  bar.hidden = !live.length;
  document.body.classList.toggle('has-timers', live.length > 0);
  bar.innerHTML = live
    .map(
      (x) => `<div class="timer ${x.end <= t ? 'is-ringing' : ''}" data-timer-id="${x.id}">
        <span class="timer-label">${esc(x.label)}</span>
        <span class="timer-count" data-end="${x.end}"></span>
        <button class="timer-x" data-cancel="${x.id}" aria-label="Stop timer for everyone">✕</button>
      </div>`,
    )
    .join('');
}

// ---------------------------------------------------------------- clock tick + alarms

const acked = new Set(store.get('tg.acked', []));
let ringing = []; // [{key, title, text, kind, id}]

function tick() {
  const t = now();
  document.querySelectorAll('[data-end]').forEach((el) => {
    const left = Number(el.dataset.end) - t;
    el.textContent = left > 0 ? countdown(left) : `Done ${countdown(left)}`;
    el.closest('.timer')?.classList.toggle('is-ringing', left <= 0);
  });
  document.querySelectorAll('[data-rel]').forEach((el) => (el.textContent = relative(Number(el.dataset.rel) - t)));
  checkAlarms(t);
}

function checkAlarms(t) {
  const due = [];
  for (const timer of state.timers) {
    if (timer.end <= t && timer.end > t - 30 * 60000) due.push({ key: `timer:${timer.id}`, kind: 'timer', id: timer.id, title: `⏱ ${timer.label}`, text: 'Time’s up.' });
  }
  if (isThanksgiving()) {
    for (const step of DAY) {
      if (!step.alarm || state.checks.day[step.id]) continue;
      const at = stepTime(state.dinner, state.shift, step.at).getTime();
      const key = `step:${step.id}:${at}`;
      if (at <= t && t < at + 20 * 60000 && !acked.has(key)) due.push({ key, kind: 'step', id: step.id, title: step.title, text: step.text });
    }
  }
  const keys = due.map((d) => d.key).join('|');
  if (keys !== ringing.map((d) => d.key).join('|')) {
    ringing = due;
    showAlarm();
  }
}

function showAlarm() {
  const box = $('#alarm');
  const top = ringing[0];
  if (!top) {
    box.hidden = true;
    stopSound();
    return;
  }
  box.hidden = false;
  $('#alarmTitle').textContent = top.title;
  $('#alarmText').textContent = top.text;
  $('#alarmMore').textContent = ringing.length > 1 ? `+${ringing.length - 1} more` : '';
  $('#alarmDone').textContent = top.kind === 'timer' ? 'Stop timer (everyone)' : '✓ Mark done (everyone)';
  $('#alarmAck').hidden = top.kind === 'timer';
  playSound();
}

function ackTop(markDone) {
  const top = ringing[0];
  if (!top) return;
  if (top.kind === 'timer') cancelTimer(top.id);
  else {
    acked.add(top.key);
    store.set('tg.acked', [...acked].slice(-200));
    if (markDone) toggle('day', top.id, true);
  }
  ringing = ringing.slice(1);
  showAlarm();
}

// ---------------------------------------------------------------- sound, vibration, screen

let audio = null;
let audioReady = false;
let beepTimer = null;

function unlockAudio() {
  try {
    // iPhone: play through the silent switch like a media app would.
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    // A silent blip inside the tap is what actually unlocks iOS audio.
    const gain = audio.createGain();
    gain.gain.value = 0.0001;
    const osc = audio.createOscillator();
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.05);
    if (!audioReady) {
      audioReady = true;
      const btn = $('#enableSound');
      if (btn) btn.remove();
    }
  } catch {
    /* no Web Audio: vibration and the on-screen alarm still work */
  }
  keepAwake();
}

function beep() {
  if (!audio || audio.state !== 'running') return;
  const t = audio.currentTime;
  [0, 0.25, 0.5].forEach((offset, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'square';
    osc.frequency.value = i === 2 ? 1175 : 880;
    gain.gain.setValueAtTime(0.0001, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.25, t + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.2);
    osc.connect(gain).connect(audio.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.22);
  });
}

function playSound() {
  if (beepTimer) return;
  const ring = () => {
    beep();
    // Browsers only allow vibration once someone has touched the page.
    if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate([300, 150, 300]);
  };
  ring();
  beepTimer = setInterval(ring, 2000);
}

function stopSound() {
  clearInterval(beepTimer);
  beepTimer = null;
  if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(0);
}

let wakeLock = null;
async function keepAwake() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible' || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => (wakeLock = null));
  } catch {
    /* refused (battery saver etc.) — nothing else to do */
  }
}

// ---------------------------------------------------------------- events

function start() {
  $('#app').hidden = false;
  readRoute();
  render();
  pull();

  setInterval(tick, 1000);
  // Steps become due as the clock moves; refresh the Thursday view so "Up
  // next" turns into "Do now" without anyone touching the phone.
  let lastFocus = '';
  setInterval(() => {
    if (route.tab !== 'today') return;
    const { current, next } = layoutDay(DAY, { dinner: state.dinner, shift: state.shift, checks: state.checks.day }, now());
    const key = `${current?.step.id}|${next?.step.id}`;
    if (key !== lastFocus) {
      lastFocus = key;
      render();
    }
  }, 5000);
  setInterval(() => document.visibilityState === 'visible' && pull(), 3000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pull();
      if (audioReady) keepAwake();
    }
  });
  window.addEventListener('focus', pull);
  window.addEventListener('online', pull);

  window.addEventListener('hashchange', () => {
    readRoute();
    render();
    scrollForRoute();
  });
  scrollForRoute();

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('[data-check]')) toggle(el.dataset.check, el.dataset.id, el.checked);
    else if (el.matches('[data-ing]')) {
      const key = `tg.ing.${el.dataset.ing}`;
      const ticked = store.get(key, {});
      if (el.checked) ticked[el.dataset.key] = 1;
      else delete ticked[el.dataset.key];
      store.set(key, ticked);
    } else if (el.id === 'hideDone') {
      store.set('tg.hideDone', el.checked);
      render();
    } else if (el.id === 'hideBought') {
      store.set('tg.hideBought', el.checked);
      render();
    } else if (el.id === 'dinnerInput' && /^\d\d:\d\d$/.test(el.value)) {
      const time = el.value;
      change({ type: 'dinner', time }, (s) => {
        s.dinner = time;
        s.shift = 0;
      });
    }
  });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, a');
    if (!el) return;
    // Any tap is a chance to unlock sound on iPhone, which only allows it
    // from inside a user gesture.
    if (isThanksgiving() && !audioReady && el.id !== 'enableSound') unlockAudio();

    if (el.id === 'enableSound') {
      unlockAudio();
      beep();
    } else if (el.dataset.timer) {
      startTimer(el.dataset.label, Number(el.dataset.timer), el.dataset.step || null);
    } else if (el.dataset.cancel) {
      cancelTimer(el.dataset.cancel);
    } else if (el.matches('button[data-check]')) {
      toggle(el.dataset.check, el.dataset.id, el.dataset.done === '1');
    } else if (el.dataset.shift) {
      const value = el.dataset.shift === 'reset' ? 0 : state.shift + Number(el.dataset.shift);
      change({ type: 'shift', minutes: value }, (s) => (s.shift = Math.max(-180, Math.min(180, value))));
    } else if (el.dataset.reset) {
      const list = el.dataset.reset;
      if (confirm(list === 'shop' ? 'Untick the whole shopping list for everyone?' : 'Untick every Thursday step for everyone?')) {
        change({ type: 'reset', list }, (s) => (s.checks[list] = {}));
      }
    } else if (el.id === 'alarmDone') ackTop(true);
    else if (el.id === 'alarmAck') ackTop(false);
    else if (el.id === 'shareBtn') share();
  });
}

function scrollForRoute() {
  requestAnimationFrame(() => {
    if (route.recipe && route.step) $(`#r-${route.step}`)?.scrollIntoView({ block: 'start' });
    else if (route.tab === 'today' && isThanksgiving()) $('.is-focus')?.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, 0);
  });
}

async function share() {
  const url = `${location.origin}/k/${KITCHEN}`;
  const text = 'Our Thanksgiving plan — tick things off as you go:';
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Thanksgiving', text, url });
      return;
    }
  } catch (error) {
    if (error && error.name === 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(url);
    flash('Link copied. Send it to your helpers.');
  } catch {
    prompt('Copy this link and send it to your helpers:', url);
  }
}

function flash(message) {
  const el = $('#flash');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(flash.t);
  flash.t = setTimeout(() => (el.hidden = true), 3000);
}

// ---------------------------------------------------------------- boot
// Last, so every declaration above exists before anything runs.

if (!KITCHEN) {
  const saved = store.get('tg.kitchen', null);
  if (saved && /^[A-Za-z0-9_-]{22}$/.test(saved)) location.replace(`/k/${saved}`);
  else showLanding();
} else {
  store.set('tg.kitchen', KITCHEN);
  start();
}
