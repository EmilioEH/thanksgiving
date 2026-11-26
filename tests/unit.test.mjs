// The plan itself: are the times right, and does the data hang together?
import test from 'node:test';
import assert from 'node:assert/strict';
import { RECIPES, PREP, SHOPPING, SHOP_SECTIONS, DAY } from '../public/js/data.js';
import { stepTime, formatClock, relative, countdown, layoutDay } from '../public/js/plan.js';

test('step times are worked back from dinner and follow the shift', () => {
  assert.equal(formatClock(stepTime('14:00', 0, -115)), '12:05 PM');
  assert.equal(formatClock(stepTime('14:00', 10, -115)), '12:15 PM');
  assert.equal(formatClock(stepTime('14:00', 0, 85)), '3:25 PM');
  assert.equal(stepTime('14:00', 0, 0).getDate(), 26);
});

test('relative and countdown text', () => {
  assert.equal(relative(25 * 60000), 'in 25 min');
  assert.equal(relative(65 * 60000), 'in 1 h 5 min');
  assert.equal(relative(-12 * 60000), '12 min ago');
  assert.equal(countdown(90 * 1000), '1:30');
  assert.equal(countdown(-5000), '+0:05');
});

test('current and next steps', () => {
  const at = stepTime('14:00', 0, -114).getTime(); // a minute after the turkey goes in
  const { current, next } = layoutDay(DAY, { dinner: '14:00', shift: 0, checks: {} }, at);
  assert.equal(current.step.id, 'gravy-veg'); // nothing ticked yet: earliest undone
  assert.equal(next.step.id, 'stock-brown');
  const checks = Object.fromEntries(DAY.filter((s) => s.at <= -115).map((s) => [s.id, 1]));
  assert.equal(layoutDay(DAY, { dinner: '14:00', shift: 0, checks }, at).current, null);
});

test('ids are unique and every link points somewhere real', () => {
  for (const list of [DAY, SHOPPING, PREP.flatMap((d) => d.tasks)]) {
    const ids = list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate id');
    for (const id of ids) assert.match(id, /^[a-z0-9-]{1,48}$/);
  }
  for (const item of [...DAY, ...PREP.flatMap((d) => d.tasks)]) {
    if (!item.recipe) continue;
    const recipe = RECIPES.find((r) => r.id === item.recipe);
    assert.ok(recipe, `${item.id} → missing recipe ${item.recipe}`);
    if (item.step) assert.ok(recipe.steps.some((s) => s.id === item.step), `${item.id} → missing step ${item.step}`);
  }
  for (const item of SHOPPING) assert.ok(SHOP_SECTIONS.includes(item.section), item.id);
  const ats = DAY.map((s) => s.at);
  assert.deepEqual(ats, [...ats].sort((a, b) => a - b), 'Thursday steps are in time order');
});

test('the one oven is never asked for two temperatures at once', () => {
  const at = (id) => DAY.find((s) => s.id === id).at;
  // 450°F from preheat until the turkey comes out; potatoes must be out by then.
  assert.ok(at('reheat-in') >= at('turkey-out'), 'casserole and sweet potatoes only go in at 400°F');
    assert.ok(at('reheat-in') - at('snacks-out') <= 120, 'make-ahead dishes are out of the fridge under 2 hours');
  assert.ok(at('to-table') - at('reheat-in') >= 30, 'sides get at least 30 min to heat through');
  // Turkey roasts 75–85 min: the planned check and removal fall in that window.
  const roast = at('turkey-out') - at('turkey-in');
  assert.ok(roast >= 75 && roast <= 85, `roast window ${roast} min`);
  // Leftovers in the fridge within 2 hours of the turkey leaving the oven.
  assert.ok(at('leftovers') - at('turkey-out') <= 120);
  // Rest 25–30 min before carving.
  const rest = at('carve') - at('turkey-out');
  assert.ok(rest >= 25 && rest <= 30, `rest ${rest} min`);
  // Nothing left in the plan for dishes that were made ahead.
  for (const gone of ['potatoes-micro', 'potatoes-oven', 'mushrooms', 'casserole-sauce', 'stuffing-saute', 'blanch', 'potatoes-reheat', 'potatoes-in']) {
    assert.ok(!DAY.some((s) => s.id === gone), gone);
  }
});
