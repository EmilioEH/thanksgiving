// Everything about this particular Thanksgiving: the menu, the days before,
// the shopping list and Thursday's timeline. The app renders it; nothing here
// knows about the DOM.
//
// Day-of steps are stored as minutes relative to dinner (`at: -115` means
// 1 h 55 min before sitting down), so changing dinner time, or shifting the
// rest of the day when the turkey runs late, moves every step together.
//
// Plan: one oven, four adults and a three-year-old, recipes kept at their
// 6–8 serving size on purpose so there are leftovers.

export const THANKSGIVING = '2026-11-26';
export const DEFAULT_DINNER = '14:00';

// ---------------------------------------------------------------- recipes

export const RECIPES = [
  {
    id: 'turkey',
    title: 'Crisp-Skinned Spatchcocked Turkey & Pan Gravy',
    source: 'J. Kenji López-Alt (Serious Eats)',
    meta: 'Prep 15 min + 24 h dry brine · Roast 75–85 min · Serves 6–8',
    ingredients: [
      {
        group: 'Turkey',
        items: [
          '1 whole unenhanced turkey (12–14 lb), spatchcocked; keep the backbone, neck and giblets (not the liver)',
          '2 Tbsp kosher salt (1 Tbsp if using table salt)',
          '1 tsp baking powder',
          '1–2 Tbsp vegetable or canola oil',
        ],
      },
      {
        group: 'Gravy',
        items: [
          'Reserved backbone, neck, giblets (no liver) and tail',
          '1 Tbsp vegetable oil',
          '1 medium yellow onion, roughly chopped',
          '2 large carrots, roughly chopped',
          '2 ribs celery, roughly chopped',
          '3–4 sprigs thyme, 2 sprigs rosemary, 4–5 sage leaves',
          '4 cups (1 quart) low-sodium chicken broth',
          '3 Tbsp unsalted butter',
          '3 Tbsp all-purpose flour',
          'Kosher salt and black pepper',
        ],
      },
    ],
    steps: [
      { id: 'brine', title: 'Dry-brine (Wednesday)', text: 'Pat the turkey completely dry with paper towels. Mix the kosher salt and baking powder and rub it evenly over all the skin. Set it skin-side up on a wire rack in a rimmed sheet pan and refrigerate uncovered for 12–24 hours.' },
      { id: 'spatchcock', title: 'Spatchcock (only if the butcher didn’t)', text: 'Breast-side down, cut along both sides of the backbone with poultry shears and remove it. Flip, splay the legs, and press hard on the breastbone until it cracks and the bird lies flat.' },
      { id: 'roast', title: 'Roast', text: 'Oven at 450°F, rack lower-middle. Rub the skin with 1–2 Tbsp oil. Set the wire rack with the turkey directly over the stuffing pan. Roast 75–85 minutes, rotating halfway if your oven has hot spots, until the thickest part of the breast reads 160°F and the thigh 175°F.', timer: 80 },
      { id: 'stock', title: 'Gravy stock (while the turkey roasts)', text: 'Chop the backbone and neck into 2-inch pieces. Heat 1 Tbsp oil in a medium saucepan over medium-high. Add the turkey parts, giblets, onion, carrots and celery; cook, stirring, until deeply browned, 8–10 minutes. Add the broth and herbs, bring to a boil, then simmer gently 45 minutes. Strain through a fine-mesh sieve (about 3½ cups).', timer: 45 },
      { id: 'rest', title: 'Rest the turkey', text: 'Move the turkey, still on its rack, to a cutting board. Tent loosely with foil and rest 25–30 minutes.', timer: 30 },
      { id: 'gravy', title: 'Finish the gravy', text: 'Wipe out the saucepan. Melt 3 Tbsp butter over medium heat, whisk in 3 Tbsp flour and cook 1 minute until golden and bubbling. Slowly whisk in the hot stock, bring to a simmer and cook 5 minutes until thickened. Season with salt and pepper.', timer: 5 },
    ],
  },
  {
    id: 'stuffing',
    title: 'Drip-Basted Herb & Sourdough Stuffing',
    source: 'America’s Test Kitchen',
    meta: 'Prep 15 min · Bakes 75–85 min under the turkey · Serves 6–8',
    ingredients: [
      {
        group: null,
        items: [
          '1 loaf (16–20 oz) hearty white or sourdough bread, cut into ½-inch cubes and left out overnight to dry (12–14 cups)',
          '5 Tbsp unsalted butter',
          '1 large yellow onion, finely chopped',
          '3 ribs celery, finely chopped',
          '2 Tbsp minced fresh sage',
          '1 Tbsp minced fresh thyme',
          '1 tsp minced fresh rosemary',
          '2½ cups low-sodium chicken broth (up to ½ cup more if the bread is very dry)',
          '2 large eggs, lightly beaten',
          '1 tsp kosher salt and ½ tsp black pepper',
        ],
      },
    ],
    steps: [
      { id: 'saute', title: 'Sauté the aromatics', text: 'Melt the butter in a saucepan or skillet over medium heat. Add the onion, celery, salt and pepper. Cook, stirring now and then, until soft and translucent, 8–10 minutes. Stir in the sage, thyme and rosemary for the last minute.', timer: 10 },
      { id: 'combine', title: 'Combine', text: 'In a large bowl, toss the dried bread with the warm butter and vegetables. Whisk the eggs into the broth, pour over the bread and fold gently until evenly damp — moist throughout, not swimming.' },
      { id: 'pack', title: 'Pack the pan', text: 'Spread the stuffing evenly in a heavy-duty 16×12-inch disposable roasting pan. The wire rack and turkey go straight on top so the drippings baste it while both roast at 450°F.' },
      { id: 'finish', title: 'Finish', text: 'When the turkey comes out to rest, stir the stuffing well to work in the drippings, then tent loosely with foil to keep warm.' },
    ],
  },
  {
    id: 'potatoes',
    title: 'Fluffy “No-Peel” Whipped Russet Potatoes',
    source: 'America’s Test Kitchen',
    meta: 'Prep 10 min · Cook 45 min, mostly hands-off · Serves 6–8',
    ingredients: [
      {
        group: null,
        items: [
          '5 lb russet potatoes (8–10 medium), scrubbed and pricked 4 times each with a fork',
          '8 Tbsp (1 stick) unsalted butter, melted',
          '1½–2 cups heavy cream or half-and-half, warmed',
          '2 tsp kosher salt, plus more to taste',
          '½ tsp black pepper',
        ],
      },
    ],
    steps: [
      { id: 'micro', title: 'Microwave', text: 'Arrange the pricked potatoes in one layer on the turntable. Microwave on High 16 minutes, flipping them halfway.', timer: 16 },
      { id: 'oven', title: 'Finish in the oven', text: 'Put the hot potatoes straight onto the upper rack of the 450°F oven, beside the turkey (no sheet pan). Bake 25–30 minutes, flipping once, until a skewer slides through the centre with no resistance.', timer: 25 },
      { id: 'scoop', title: 'Scoop', text: 'Holding each potato in a towel or oven mitt, halve it lengthwise and scoop the flesh into a microwave-safe serving bowl. Discard the skins.' },
      { id: 'whip', title: 'Whip', text: 'Break up the potato with a masher or hand mixer. Fold in the melted butter, 1½ cups warm cream, the salt and pepper until smooth, adding up to ½ cup more cream to taste. Cover with foil. If it cools, reheat in the same bowl at 75% power for 3–5 minutes.' },
    ],
  },
  {
    id: 'beans',
    title: 'From-Scratch Creamy Mushroom Green Bean Casserole',
    source: 'Adapted from J. Kenji López-Alt',
    meta: 'Prep 15 min · Bake 20–25 min · Serves 6–8',
    ingredients: [
      {
        group: null,
        items: [
          '2 lb green beans: fresh (trimmed and halved) or frozen cut beans, thawed and patted dry (frozen skips blanching)',
          '2 Tbsp unsalted butter',
          '1 lb cremini mushrooms, wiped and thinly sliced',
          '3 cloves garlic, minced',
          '1 Tbsp fresh thyme leaves, minced',
          '3 Tbsp all-purpose flour',
          '1 cup low-sodium chicken broth',
          '1 cup heavy cream',
          '1 tsp soy sauce or Worcestershire sauce',
          'Kosher salt and black pepper',
          '1 container (6 oz) crispy fried onions',
        ],
      },
    ],
    steps: [
      { id: 'blanch', title: 'Blanch (fresh beans only)', text: 'Boil the fresh beans in salted water 3–4 minutes until bright green and crisp-tender, then drain. Skip this with thawed frozen beans.', timer: 4 },
      { id: 'mushrooms', title: 'Brown the mushrooms', text: 'Melt the butter in a 12-inch skillet over medium-high. Add the mushrooms and a pinch of salt. Cook, stirring occasionally, until the liquid is gone and they are deeply browned, 8–10 minutes.', timer: 10 },
      { id: 'sauce', title: 'Make the sauce', text: 'Add the garlic and thyme, cook 30 seconds. Sprinkle in the flour and stir constantly 1 minute. Slowly whisk in the broth, cream and soy sauce. Simmer until it coats a spoon, 3–4 minutes. Season well with pepper and salt.', timer: 4 },
      { id: 'assemble', title: 'Assemble', text: 'Fold in the green beans and half the fried onions. Spread in a disposable 9×13-inch foil pan.' },
      { id: 'bake', title: 'Bake', text: 'Bake uncovered at 400°F for 15 minutes until bubbling at the edges. Scatter the rest of the onions on top and bake 5–10 minutes more until golden.', timer: 15 },
    ],
  },
  {
    id: 'cranberry',
    title: '10-Minute Spiced Cranberry Sauce',
    source: 'J. Kenji López-Alt',
    meta: 'Prep 2 min · Cook 10 min · About 2 cups · Make ahead up to 5 days',
    ingredients: [
      {
        group: null,
        items: [
          '1 bag (12 oz) fresh cranberries, rinsed and picked over',
          '1 cup granulated sugar',
          '1 cup water (or ½ cup water + ½ cup fresh orange juice)',
          '1 cinnamon stick (optional)',
          'Pinch of kosher salt',
        ],
      },
    ],
    steps: [
      { id: 'combine', title: 'Combine cold', text: 'Put the cranberries, sugar, water, cinnamon stick and salt in a small saucepan.' },
      { id: 'simmer', title: 'Simmer', text: 'Bring to a boil over medium-high, then simmer over medium, stirring now and then, until nearly all the berries have burst and the sauce is glossy, about 10 minutes. It looks looser than jam while hot and sets as it cools.', timer: 10 },
      { id: 'chill', title: 'Chill', text: 'Remove the cinnamon stick. Pour into the serving bowl, cool to room temperature, cover and refrigerate.' },
    ],
  },
];

// ---------------------------------------------------------------- days before

export const PREP = [
  {
    date: '2026-11-22',
    label: 'Sunday',
    tasks: [
      { id: 'reserve-turkey', title: 'Reserve a fresh turkey for Tuesday pickup', text: '12–14 lb, “unenhanced” (no salt solution added). Ask the butcher to spatchcock it and to give you the backbone, neck and giblets. Buy fresh: a frozen bird won’t thaw in the fridge in time for Wednesday.' },
      { id: 'check-gear', title: 'Check your equipment', text: 'Most important: a wire rack that sits on the rim of a 16×12-inch roasting pan. Also an instant-read thermometer, a fine-mesh sieve, a 12-inch skillet, a medium saucepan, and a big microwave-safe serving bowl.' },
      { id: 'list-review', title: 'Go through the shopping list', text: 'Tick off anything you already have, so the list only shows what to buy.', link: 'shop' },
    ],
  },
  {
    date: '2026-11-23',
    label: 'Monday',
    tasks: [
      { id: 'shop-1', title: 'Big shop: everything that keeps', text: 'Pantry, spices, potatoes, onions, carrots, celery, garlic, cranberries, butter, eggs, fried onions, drinks, snacks, disposable pans and foil. Leave herbs, mushrooms, cream and bread for Tuesday.', link: 'shop' },
    ],
  },
  {
    date: '2026-11-24',
    label: 'Tuesday',
    tasks: [
      { id: 'pickup-turkey', title: 'Pick up the turkey', text: 'Check it is spatchcocked and the backbone, neck and giblets are in the bag. Keep it in the coldest part of the fridge.' },
      { id: 'shop-2', title: 'Fresh shop', text: 'Herbs (sage, thyme, rosemary), mushrooms, heavy cream, the bread loaf, rolls and pie.', link: 'shop' },
      { id: 'clear-fridge', title: 'Clear fridge space', text: 'You need a shelf for a sheet pan with the turkey on a rack, uncovered, from Wednesday until Thursday morning.' },
    ],
  },
  {
    date: '2026-11-25',
    label: 'Wednesday',
    tasks: [
      { id: 'dry-brine', title: 'Dry-brine the turkey (by about noon)', text: '12–24 hours before it goes in the oven. Pat dry, rub with 2 Tbsp kosher salt + 1 tsp baking powder, set skin-side up on a rack in a rimmed sheet pan, refrigerate uncovered.', recipe: 'turkey', step: 'brine' },
      { id: 'make-cranberry', title: 'Make the cranberry sauce', text: 'Ten minutes on the stove, then into the serving bowl, cool and refrigerate.', recipe: 'cranberry' },
      { id: 'thaw-beans', title: 'Thaw the green beans (if frozen)', text: 'Move them to the fridge so they are ready to pat dry tomorrow.' },
      { id: 'cube-bread', title: 'Cube the bread and leave it out (evening)', text: 'Cut into ½-inch cubes and spread on sheet pans or a big tray, uncovered, to dry overnight.' },
      { id: 'chill-drinks', title: 'Chill drinks, check the pie', text: 'If the pie needs refrigerating, keep it cold. Set out the pans, rack, thermometer and foil for the morning.' },
    ],
  },
];

// ---------------------------------------------------------------- shopping

export const SHOP_SECTIONS = ['Meat', 'Produce', 'Dairy & eggs', 'Bakery', 'Frozen', 'Pantry', 'Spices & baking', 'Dessert, drinks & snacks', 'Supplies'];

export const SHOPPING = [
  { id: 'turkey', section: 'Meat', name: 'Fresh unenhanced turkey, 12–14 lb', note: 'Spatchcocked by the butcher; keep backbone, neck, giblets' },

  { id: 'russets', section: 'Produce', name: 'Russet potatoes, 5 lb', note: '8–10 medium' },
  { id: 'onions', section: 'Produce', name: 'Yellow onions, 3', note: '1 medium gravy, 1 large stuffing, 1 spare' },
  { id: 'carrots', section: 'Produce', name: 'Carrots, 2 large', note: 'Gravy' },
  { id: 'celery', section: 'Produce', name: 'Celery, 1 bunch', note: '5 ribs: gravy and stuffing' },
  { id: 'garlic', section: 'Produce', name: 'Garlic, 1 head', note: '3 cloves for the casserole' },
  { id: 'mushrooms', section: 'Produce', name: 'Cremini (baby bella) mushrooms, 1 lb', note: 'Casserole · buy Tuesday' },
  { id: 'green-beans', section: 'Produce', name: 'Green beans, 2 lb', note: 'Or 2 lb frozen cut beans — no blanching needed' },
  { id: 'cranberries', section: 'Produce', name: 'Fresh cranberries, 12 oz bag', note: '' },
  { id: 'thyme', section: 'Produce', name: 'Fresh thyme, 2 small packs', note: 'Gravy, stuffing, casserole · buy Tuesday' },
  { id: 'sage', section: 'Produce', name: 'Fresh sage, 1 pack', note: 'Gravy and stuffing · buy Tuesday' },
  { id: 'rosemary', section: 'Produce', name: 'Fresh rosemary, 1 pack', note: 'Gravy and stuffing · buy Tuesday' },
  { id: 'orange', section: 'Produce', name: 'Orange, 1 (optional)', note: 'For the cranberry sauce' },

  { id: 'butter', section: 'Dairy & eggs', name: 'Unsalted butter, 1 lb (4 sticks)', note: 'Recipes use 18 Tbsp; the rest is for the rolls' },
  { id: 'cream', section: 'Dairy & eggs', name: 'Heavy cream, 1 quart', note: 'Up to 3 cups: potatoes and casserole · buy Tuesday' },
  { id: 'eggs', section: 'Dairy & eggs', name: 'Large eggs, 2', note: 'Stuffing' },

  { id: 'bread', section: 'Bakery', name: 'Sourdough or hearty white loaf, 16–20 oz', note: 'Cubed Wednesday night · buy Tuesday' },
  { id: 'rolls', section: 'Bakery', name: 'Dinner rolls, 1 dozen', note: 'Warmed at the end' },

  { id: 'frozen-beans', section: 'Frozen', name: '(Only if not buying fresh beans) frozen cut green beans, 2 lb', note: 'Thaw in the fridge Wednesday' },

  { id: 'broth', section: 'Pantry', name: 'Low-sodium chicken broth, 2 × 32 oz cartons', note: 'Up to 8 cups in all; a third carton is cheap insurance' },
  { id: 'fried-onions', section: 'Pantry', name: 'Crispy fried onions, 6 oz', note: 'Casserole' },
  { id: 'flour', section: 'Pantry', name: 'All-purpose flour', note: '6 Tbsp', staple: true },
  { id: 'sugar', section: 'Pantry', name: 'Granulated sugar', note: '1 cup', staple: true },
  { id: 'oil', section: 'Pantry', name: 'Vegetable or canola oil', note: 'About 3 Tbsp', staple: true },
  { id: 'soy', section: 'Pantry', name: 'Soy sauce or Worcestershire', note: '1 tsp', staple: true },

  { id: 'kosher-salt', section: 'Spices & baking', name: 'Kosher salt', note: 'About ¼ cup in all', staple: true },
  { id: 'pepper', section: 'Spices & baking', name: 'Black pepper', note: '', staple: true },
  { id: 'baking-powder', section: 'Spices & baking', name: 'Baking powder', note: '1 tsp, for crackling skin', staple: true },
  { id: 'cinnamon', section: 'Spices & baking', name: 'Cinnamon stick', note: 'Optional, cranberry sauce', staple: true },

  { id: 'pie', section: 'Dessert, drinks & snacks', name: 'Pie (store-bought)', note: 'Plus whipped cream or ice cream' },
  { id: 'drinks', section: 'Dessert, drinks & snacks', name: 'Drinks', note: 'Something kid-friendly for the 3-year-old' },
  { id: 'snacks', section: 'Dessert, drinks & snacks', name: 'Snacks for before dinner', note: 'Cheese, crackers, nuts, veg' },

  { id: 'roast-pan', section: 'Supplies', name: 'Heavy-duty disposable roasting pan, 16×12 in', note: 'Stuffing; the turkey rack sits on its rim' },
  { id: 'foil-pan', section: 'Supplies', name: 'Disposable foil pan, 9×13 in', note: 'Casserole' },
  { id: 'foil', section: 'Supplies', name: 'Aluminium foil', note: 'Tenting and rolls', staple: true },
  { id: 'paper-towels', section: 'Supplies', name: 'Paper towels', note: 'Drying the turkey', staple: true },
  { id: 'containers', section: 'Supplies', name: 'Leftover containers or zip bags', note: 'You want leftovers — have somewhere to put them' },
  { id: 'thermometer', section: 'Supplies', name: 'Instant-read thermometer', note: 'If you don’t have one, buy one: it decides when the turkey is done', staple: true },
];

// ---------------------------------------------------------------- Thursday

// `at`: minutes relative to dinner. `alarm`: sound an alert when it's due.
// `timer`: offer a one-tap shared timer. `recipe`/`step`: link to the recipe.
export const DAY = [
  // Already done ahead: mashed potatoes, green bean casserole and roasted
  // sweet potatoes made; bread cubed; stuffing onion and celery sautéed;
  // turkey spatchcocked and dry-brining; backbone, neck and giblets in the fridge.
  { id: 'gravy-veg', at: -165, title: 'Chop the gravy vegetables', alarm: true, text: 'Roughly chop 1 medium onion, 2 carrots and 2 celery ribs. Set out 3–4 thyme sprigs, 2 rosemary sprigs and 4–5 sage leaves. Chop the backbone and neck into 2-inch pieces.' },
  { id: 'preheat', at: -150, title: 'Preheat the oven to 450°F', alarm: true, text: 'One rack lower-middle for the turkey, one in the upper third.' },
  { id: 'stuffing-pack', at: -145, title: 'Stuffing: mix and pack the pan', alarm: true, text: 'Warm the sautéed onion and celery for a minute in the microwave so the butter melts (stir in the herbs now if they’re not in yet). Toss with the bread cubes. Whisk 2 eggs into 2½ cups broth, pour over, fold until evenly damp, and spread in the 16×12 pan.', recipe: 'stuffing', step: 'combine' },
  { id: 'turkey-ready', at: -120, title: 'Oil the turkey, set it over the stuffing', text: 'Rub 1–2 Tbsp oil over the skin. Set the wire rack with the turkey on the rim of the stuffing pan.', recipe: 'turkey', step: 'roast' },
  { id: 'turkey-in', at: -115, title: 'Turkey and stuffing into the oven', alarm: true, text: 'Lower-middle rack. Start the timer: first temperature check at 70 minutes.', recipe: 'turkey', step: 'roast', timer: 70 },
  { id: 'stock-brown', at: -110, title: 'Gravy stock: brown the turkey parts and vegetables', text: 'Medium saucepan, 1 Tbsp oil, medium-high: backbone, neck, giblets and the chopped vegetables, 8–10 minutes until deeply browned.', recipe: 'turkey', step: 'stock', timer: 10 },
  { id: 'stock-simmer', at: -100, title: 'Gravy stock: add broth and herbs, simmer 45 min', alarm: true, text: '4 cups broth plus the herb sprigs. Boil, then a gentle simmer.', recipe: 'turkey', step: 'stock', timer: 45 },
  { id: 'snacks-out', at: -90, title: 'Snacks and drinks out; make-ahead dishes out of the fridge', alarm: true, text: 'Set out snacks. Take the mashed potatoes, green bean casserole and sweet potatoes out of the fridge so they aren’t fridge-cold when they go in (well under the 2-hour limit).' },
  { id: 'potatoes-in', at: -55, title: 'Mashed potatoes into the oven', alarm: true, text: 'Foil pan covered tightly with foil, upper rack beside the turkey (it’s 450°F, which is fine covered). They stay in until dinner — about 50 minutes in all. Aluminium can’t go in the microwave.', recipe: 'potatoes', step: 'whip' },
  { id: 'stock-strain', at: -55, title: 'Strain the gravy stock', text: 'Through a fine-mesh sieve into a measuring cup (about 3½ cups). Keep it warm.', recipe: 'turkey', step: 'stock' },
  { id: 'temp-check', at: -45, title: 'Check the turkey temperature', alarm: true, text: 'Thickest part of the breast 160°F, thigh 175°F. Not there yet? Check every 5 minutes — and use “Running late” below if it needs more than about 10 extra minutes.', recipe: 'turkey', step: 'roast' },
  { id: 'turkey-out', at: -35, title: 'Turkey out to rest; oven down to 400°F', alarm: true, text: 'Turkey on its rack to a cutting board, tent with foil, rest 25–30 min. Stir the stuffing to soak up the drippings and tent it. Turn the oven to 400°F, door open a minute to drop the heat. While the door is open, stir the mashed potatoes (a splash of warm cream if they look stiff), re-cover, and put them back.', recipe: 'turkey', step: 'rest', timer: 30 },
  { id: 'reheat-in', at: -30, title: 'Casserole and sweet potatoes into the oven', alarm: true, text: 'Both at 400°F: casserole on the middle rack, sweet potatoes on the upper rack next to the mashed potatoes (if they don’t both fit, sweet potatoes beside the casserole). Casserole uncovered, without the onion topping yet (if it was already baked, cover it with foil). Sweet potatoes loosely covered with foil so they don’t dry out.', recipe: 'beans', step: 'bake', timer: 20 },
  { id: 'gravy', at: -30, title: 'Make the gravy', text: 'Wipe out the saucepan: 3 Tbsp butter, 3 Tbsp flour, 1 minute, whisk in the hot stock, simmer 5 minutes. Season.', recipe: 'turkey', step: 'gravy', timer: 5 },
  { id: 'cranberry-out', at: -20, title: 'Cranberry sauce to the table; pour drinks', text: 'Take it out of the fridge.' },
  { id: 'casserole-top', at: -12, title: 'Onions on the casserole; rolls in', alarm: true, text: 'Scatter the fried onions over the casserole and bake 8 minutes more until golden. Wrap the rolls in foil and put them in too. Check the sweet potatoes are hot in the middle; take them out when they are.', recipe: 'beans', step: 'bake', timer: 8 },
  { id: 'carve', at: -5, title: 'Carve the turkey', text: 'Legs and thighs off first, then slice the breasts off the bone and across the grain.' },
  { id: 'to-table', at: -3, title: 'Everything to the table', alarm: true, text: 'Casserole, mashed potatoes, sweet potatoes and rolls out of the oven (the foil pans are hot — use mitts underneath). Stuffing, potatoes, gravy, cranberry sauce.' },
  { id: 'dinner', at: 0, title: 'Dinner!', alarm: true, text: 'Sit down. You did it.' },
  { id: 'pie-out', at: 30, title: 'Take the pie out of the fridge', text: 'So it isn’t fridge-cold for dessert.' },
  { id: 'leftovers', at: 85, title: 'Leftovers into the fridge', alarm: true, text: 'Within 2 hours of coming out of the oven. Carve the rest of the turkey off the bone first — it chills faster and reheats better.' },
];
