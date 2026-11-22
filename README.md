# Thanksgiving

A shared plan for one Thanksgiving dinner (Thursday 26 Nov 2026, one oven,
five recipes), used from phones by the cook and whoever is helping.

- **Before**: Sunday–Wednesday tasks (reserve and pick up the turkey, shop,
  dry-brine, cranberry sauce, dry the bread).
- **Shopping**: the five recipes' ingredients combined by store section, plus
  pie, rolls, drinks, snacks and supplies. Tick what you've bought or have.
- **Thursday**: the cooking timeline, worked back from dinner time, with
  shared one-tap timers, alarms (sound + vibration) when key steps are due,
  and "running late" buttons that shift every remaining step for everyone.
- **Recipes**: big-text cooking view with ingredient check-offs and timers.

Everyone with the link sees the same ticks, timers and dinner time within a
few seconds. Each plan lives at `/k/<random id>`; the id is the only thing
protecting it, so share the link only with people you want in the kitchen.

## Run locally

```bash
npm install
npm run dev            # http://localhost:8787 (wrangler dev, with the shared state)
```

## Tests

```bash
npm run test:unit      # timeline arithmetic + data checks (one-oven conflicts, 2-hour leftovers rule)
npm run dev &          # then, in another shell:
npm run test:e2e       # two emulated phones (iPhone + Pixel sizes) against the local server
```

The e2e test uses Chromium at phone sizes. It does not run real iOS Safari.

## Deploy

Cloudflare Workers via the GitHub integration: import the repo as a Worker
named `thanksgiving` (must match `name` in `wrangler.jsonc`), no build command,
deploy command `npx wrangler deploy`. The Durable Object migration in
`wrangler.jsonc` creates the storage on the first deploy (works on the free
plan).

## Notes for Thursday

- Open the link and tap **Turn on alarm sound** once on each phone. iPhones
  only allow sound after a tap, and stop running web pages in the
  background, so keep the app open on screen (it keeps the screen awake).
- Alarms only fire on Thursday, and only for steps due in the last 20 minutes,
  so opening the app late doesn't set off a pile of old alarms.
