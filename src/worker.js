// Shared kitchen state.
//
// One Durable Object per Thanksgiving ("kitchen"), addressed by the random id
// in its link. Everyone who opens that link reads and writes the same small
// JSON document: what's been ticked off, running timers, dinner time, and any
// running-late shift. A Durable Object handles one request at a time, so two
// phones ticking boxes at once can never overwrite each other.

import { DurableObject } from 'cloudflare:workers';

const KITCHEN_ID = /^[A-Za-z0-9_-]{22}$/;
const LISTS = new Set(['day', 'prep', 'shop']);
const ITEM_ID = /^[a-z0-9-]{1,48}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_TIMERS = 12;

const fresh = () => ({ v: 0, dinner: '14:00', shift: 0, checks: { day: {}, prep: {}, shop: {} }, timers: [] });

export class Kitchen extends DurableObject {
  async load() {
    return (await this.ctx.storage.get('state')) || fresh();
  }

  async read() {
    const state = await this.load();
    // Drop timers that ended long ago so the list doesn't grow all day.
    const now = Date.now();
    state.timers = state.timers.filter((t) => t.end > now - 30 * 60000);
    return { ...state, now };
  }

  async apply(op) {
    const state = await this.load();
    const now = Date.now();
    switch (op && op.type) {
      case 'check': {
        if (!LISTS.has(op.list) || !ITEM_ID.test(op.id || '')) throw new Error('bad item');
        if (op.done) state.checks[op.list][op.id] = now;
        else delete state.checks[op.list][op.id];
        break;
      }
      case 'timer': {
        const minutes = Number(op.minutes);
        if (!(minutes > 0 && minutes <= 240)) throw new Error('bad minutes');
        const label = String(op.label || 'Timer').slice(0, 80);
        state.timers = state.timers.filter((t) => t.end > now - 30 * 60000).slice(-(MAX_TIMERS - 1));
        // The phone that started the timer says when it ends, so the end
        // matches that phone's own clock; phones in one kitchen agree to
        // within a second or two.
        const end = Number.isFinite(op.end) ? op.end : now + minutes * 60000;
        state.timers.push({ id: crypto.randomUUID().slice(0, 8), label, step: ITEM_ID.test(op.step || '') ? op.step : null, end });
        break;
      }
      case 'timerCancel': {
        state.timers = state.timers.filter((t) => t.id !== op.id);
        break;
      }
      case 'dinner': {
        if (!HHMM.test(op.time || '')) throw new Error('bad time');
        state.dinner = op.time;
        state.shift = 0;
        break;
      }
      case 'shift': {
        const minutes = Math.round(Number(op.minutes));
        if (!Number.isFinite(minutes)) throw new Error('bad shift');
        state.shift = Math.max(-180, Math.min(180, minutes));
        break;
      }
      case 'reset': {
        if (!LISTS.has(op.list)) throw new Error('bad list');
        state.checks[op.list] = {};
        break;
      }
      default:
        throw new Error('unknown change');
    }
    state.v++;
    await this.ctx.storage.put('state', state);
    return { ...state, now };
  }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
  });

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/new' && request.method === 'POST') {
      return json({ id: newId() });
    }

    const match = url.pathname.match(/^\/api\/k\/([^/]+)$/);
    if (match) {
      const id = match[1];
      if (!KITCHEN_ID.test(id)) return json({ error: 'Not found' }, 404);
      const kitchen = env.KITCHEN.get(env.KITCHEN.idFromName(id));
      if (request.method === 'GET') return json(await kitchen.read());
      if (request.method === 'POST') {
        let op;
        try {
          op = await request.json();
        } catch {
          return json({ error: 'Bad request' }, 400);
        }
        try {
          return json(await kitchen.apply(op));
        } catch (error) {
          return json({ error: String(error.message || error) }, 400);
        }
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
