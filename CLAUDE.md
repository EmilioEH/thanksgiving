# CLAUDE.md

Shared Thanksgiving planner. Plain HTML/CSS/ES modules in `public/` (no build
step) served as Cloudflare Workers static assets, plus `src/worker.js`: a tiny
API over one Durable Object per plan ("kitchen") holding ticks, timers, dinner
time and the running-late shift.

- `public/js/data.js` — the menu, prep days, shopping list and Thursday steps.
  Thursday steps use minutes relative to dinner (`at`), never clock times.
- `public/js/plan.js` — pure time arithmetic (unit-tested under Node).
- `public/js/app.js` — sync (3 s polling + optimistic updates), views, timers,
  alarms, wake lock. The boot block must stay at the end of the file.
- Run `npm run test:unit`, and `npm run test:e2e` against `npm run dev`,
  before committing. The unit tests also enforce the one-oven schedule.

Constraints: one oven; sounds need a user tap on iOS; iPhones suspend
background pages, so alarms only work with the app open. Item ids in
`data.js` are stored in shared state — renaming one loses its tick.
