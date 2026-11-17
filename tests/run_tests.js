/* Steadfast Health checks: the engine and the API router over an in-memory store, the same code the pages run.
   Run: npm test   (or node tests/run_tests.js) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console, URL, Set, Map, Date, Math, JSON, Promise, Object, Array, String, Number, Error, RegExp, isNaN, parseFloat, parseInt, encodeURIComponent, decodeURIComponent };
ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['data/library.js', 'js/store.js', 'js/engine.js', 'js/api.js', 'js/import.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const HT = ctx.HT, E = HT.E, LIB = ctx.HT_LIB;

let failures = 0, current = '';
function check(name, ok, detail) { console.log((ok ? '  ok   ' : '  FAIL ') + name + (ok || detail === undefined ? '' : '  -> ' + JSON.stringify(detail))); if (!ok) failures++; }
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function fresh() { const S = HT.memoryStore(); return { S, api: (m, p, b) => HT.route(S, m, p, b) }; }
async function throws(fn, status) { try { await fn(); return false; } catch (e) { return status ? e.status === status : true; } }
function setNow(ds) { HT.now = ds ? () => { const [y, m, d] = ds.split('-').map(Number); return new Date(y, m - 1, d, 12); } : null; }
function ms(ds, h) { const [y, m, d] = ds.split('-').map(Number); return new Date(y, m - 1, d, h || 12).getTime(); }
async function section(name, fn) { current = name; console.log(name); try { await fn(); } catch (e) { check('ran without error', false, e.stack); } setNow(null); }

(async () => {
  await section('1. The library', async () => {
    const ids = new Set(LIB.foods.map(f => f.id));
    check('127 foods and 97 meals', LIB.foods.length === 127 && LIB.meals.length === 97, [LIB.foods.length, LIB.meals.length]);
    check('food ids are unique', ids.size === LIB.foods.length);
    check('meal ids are unique', new Set(LIB.meals.map(m => m.id)).size === LIB.meals.length);
    check('every ingredient is a library food', LIB.meals.every(m => m.ingredients.every(i => ids.has(i.food_id))));
    check('every food has nutrition', LIB.foods.every(f => f.kcal_100 != null));
    check('green foods start unlocked, yellow and red locked', LIB.foods.every(f => f.unlocked === (f.light === 'green')));
    const { S } = fresh(), mm = E.mealMacros(S);
    check('every meal can be measured', Object.values(mm).every(m => m.complete), Object.keys(mm).filter(k => !mm[k].complete));
    const soup = mm['shrimp-garlic-and-jalapeno-soup'];
    check('shrimp soup: 552 kcal, 68 g protein (as the old app had it)', soup && soup.kcal === 552 && soup.protein === 68, soup);
  });

  await section('2. Weight and blood pressure', async () => {
    const { S, api } = fresh();
    await api('PATCH', '/api/settings', { start_weight: 280, target_weight: 180, start_date: '2026-11-01' });
    setNow('2026-11-15');
    let s = await api('POST', '/api/weight', { date: '2026-11-01', weight: 280 });
    check('first weigh-in', s.current === 280 && s.lost === 0);
    await api('POST', '/api/weight', { date: '2026-11-08', weight: 276 });
    s = await api('POST', '/api/weight', { date: '2026-11-15', weight: 272.5 });
    check('lost 7.5, 92.5 to go', s.current === 272.5 && s.lost === 7.5 && s.to_go === 92.5, s);
    check('a pace and a projected date', s.rate_per_week < -3 && s.projected_date > '2027-01-01', [s.rate_per_week, s.projected_date]);
    s = await api('POST', '/api/weight', { date: '2026-11-15', weight: 272 });
    check('same day replaces', s.entries.length === 3 && s.current === 272);
    s = await api('DELETE', '/api/weight/' + s.entries[0].id);
    check('delete', s.entries.length === 2);
    check('weight out of range refused', await throws(() => api('POST', '/api/weight', { weight: 20 }), 422));
    check('bad date refused', await throws(() => api('POST', '/api/weight', { date: '2026-13-01', weight: 200 }), 400));
    await api('POST', '/api/bp', { taken_at: '2026-11-14T07:00', systolic: 150, diastolic: 95, pulse: 70 });
    const b = await api('POST', '/api/bp', { taken_at: '2026-11-15T07:00', systolic: 130, diastolic: 85 });
    check('BP averages and bands', b.latest.systolic === 130 && b.avg7.systolic === 140 && b.avg7.n === 2 && b.category === 'stage2' && b.entries[1].category === 'stage1', b.avg7);
  });

  await section('3. Meal plans and the shopping list', async () => {
    const { S, api } = fresh();
    const p = await api('POST', '/api/plans', { week_start: '2026-11-11', away_days: ['2026-11-12'] });
    check('a week from Monday', p.week_start === '2026-11-09' && p.days.length === 7 && p.days.every(d => d.slots.length === 5));
    check('every slot filled', p.days.every(d => d.slots.every(s => s.meal_id)));
    const meals = E.mealMap(S), foods = E.foodMap(S);
    check('only allowed foods', p.days.every(d => d.slots.every(s => meals[s.meal_id].ingredients.every(i => foods[i.food_id].unlocked && foods[i.food_id].light !== 'red'))));
    check('away day meals are portable (dinner aside)', p.days.find(d => d.date === '2026-11-12').away === 1 && p.days.find(d => d.date === '2026-11-12').slots.filter(s => s.slot !== 'dinner').every(s => s.portable));
    check('no dinner twice in a row', p.days.every((d, i) => !i || d.slots[2].meal_id !== p.days[i - 1].slots[2].meal_id));
    check('day totals', p.days.every(d => d.nutrition.kcal > 1000 && d.nutrition.complete));
    const again = await api('POST', '/api/plans', { week_start: '2026-11-09' });
    check('asking again returns the same plan', again.id === p.id && eq(again.days, p.days));
    const shop = await api('GET', `/api/plans/${p.id}/shopping`);
    const item = shop[0].items[0];
    check('shopping list grouped by section, Meat first', shop[0].section === 'Meat' && item.qty > 0, shop.map(g => g.section));
    const after = await api('PATCH', `/api/plans/${p.id}/shopping/${item.food_id}`, { checked: true });
    check('check an item', after[0].items.find(x => x.food_id === item.food_id).checked === 1);
    const slot = p.days[0].slots[0], other = Object.values(meals).find(m => m.meal_type === 'breakfast' && m.id !== slot.meal_id);
    const swapped = await api('PATCH', `/api/plans/slots/${slot.id}`, { meal_id: other.id });
    check('swap a slot', swapped.days[0].slots[0].meal_id === other.id && swapped.days[0].slots[1].meal_id === p.days[0].slots[1].meal_id);
    const away = await api('PATCH', `/api/plans/days/${p.days[0].id}`, { away: true });
    check('mark a day away', away.days[0].away === 1);
    const bc = await api('GET', `/api/plans/${p.id}/batch`);
    check('cooler bag lists the away days', bc.cooler.length === 2 && bc.cooler.every(c => c.pack.length));
    // pantry: build next week from this week's groceries
    const have = new Set(shop.flatMap(g => g.items.map(i => i.food_id)));
    const nxt = await api('POST', '/api/plans', { week_start: '2026-11-16', pantry_from: p.id });
    const need = new Set((await api('GET', `/api/plans/${nxt.id}/shopping`)).flatMap(g => g.items.map(i => i.food_id)));
    check('pantry week uses only what is on hand', [...need].every(f => have.has(f)) && eq(nxt.to_buy, []), [...need].filter(f => !have.has(f)));
    check('pantry from a missing plan is refused', await throws(() => api('POST', '/api/plans', { week_start: '2026-11-23', pantry_from: 9999 }), 404));
    const replaced = await api('POST', '/api/plans', { week_start: '2026-11-16', replace: true });
    check('replace makes a new plan', replaced.id !== nxt.id && S.db.plans.length === 2);
    // foods: unlock, ban, add
    const ham = E.foodMap(S)['deli-ham'];
    let f = await api('PATCH', '/api/foods/deli-ham', { light: 'red' });
    check('ban a food', f.light === 'red' && (await api('GET', '/api/meals')).filter(m => m.ingredients.some(i => i.food_id === 'deli-ham')).every(m => !m.allowed));
    f = await api('PATCH', '/api/foods/deli-ham', { light: ham.light });
    const added = await api('POST', '/api/foods', { name: 'Elk steak', category: 'meat', store_section: 'Meat' });
    check('add a food', added.id.startsWith('u-') && added.unlocked && (await api('GET', '/api/foods')).some(x => x.name === 'Elk steak'));
    check('no duplicate names', await throws(() => api('POST', '/api/foods', { name: 'elk steak' }), 409));
    const m = await api('PATCH', '/api/meals/egg-salad', { enabled: false });
    check('turn a meal off', m.enabled === 0 && !E.allowedMeals(S).some(x => x.id === 'egg-salad'));
    check('unknown meal 404', await throws(() => api('PATCH', '/api/meals/nope', { enabled: true }), 404));
  });

  await section('4. Workout log', async () => {
    const { S, api } = fresh();
    await E.seedDefaultWorkouts(S);
    let day = await api('GET', '/api/log/2026-11-12');
    const push = day.workouts.find(w => w.workout === 'Push');
    check('new person starts with Push, Pull, Legs', eq(day.workouts.map(w => w.workout), ['Legs', 'Pull', 'Push']));
    check('targets on each exercise', eq(push.exercises[0], { exercise: 'Bench Press', ord: 0, note: '3 sets of 10', target_sets: 3, target_reps: 10, last: null }), push.exercises[0]);
    const t = ms('2026-11-10');
    const s1 = await api('POST', '/api/log/sets', { session_ms: t, workout: 'Push', exercise: 'Bench Press', weight: 100, reps: 10 });
    const s2 = await api('POST', '/api/log/sets', { session_ms: t, workout: 'Push', exercise: 'Bench Press', weight: 100, reps: 8 });
    check('sets in order on the right day', s1.date === '2026-11-10' && s2.set_ms > s1.set_ms);
    check('an exercise is required', await throws(() => api('POST', '/api/log/sets', { session_ms: t, workout: 'Push', exercise: ' ' })));
    day = await api('GET', '/api/log/2026-11-10');
    check('the session with volume', day.sessions.length === 1 && day.sessions[0].sets === 2 && day.sessions[0].volume === 1800);
    day = await api('GET', '/api/log/2026-11-12');
    check('last time is the number to beat', eq(day.workouts.find(w => w.workout === 'Push').exercises[0].last, { date: '2026-11-10', sets: [{ weight: 100, reps: 10 }, { weight: 100, reps: 8 }] }));
    setNow('2026-11-12');
    await api('PATCH', '/api/settings', { lift_rotation: 'Push,Pull,Legs,Push,Pull,Legs,Rest' });
    const wk = await api('GET', '/api/training/week/2026-11-10');
    const tue = wk.days[1].items.find(x => x.what === 'Lift'), mon = wk.days[0].items.find(x => x.what === 'Lift');
    check('the training week sees it (Push done on a Pull day; Monday missed)', tue.workout === 'Push' && tue.status === 'done' && mon.status === 'missed', [mon, tue]);
    check('sessions list', (await api('GET', '/api/gym/sessions')).sessions[0].sets === 2);
    check('edit a set', (await api('PATCH', `/api/log/sets/${s2.id}`, { weight: 105 })).weight === 105);
    const many = await api('POST', '/api/log/sets/batch', { session_ms: t, workout: 'Push', exercise: 'Dips', weight: null, reps: 12, count: 3 });
    check('log three sets in one tap, in order', many.length === 3 && many.every(x => x.reps === 12 && x.weight === null) && many[2].set_ms > many[1].set_ms && many[1].set_ms > many[0].set_ms);
    check('a count over 20 is refused', await throws(() => api('POST', '/api/log/sets/batch', { session_ms: t, workout: 'Push', exercise: 'Dips', reps: 1, count: 50 }), 422));
    const ed = await api('PATCH', `/api/log/sets/${many[0].id}`, { weight: 25, reps: 10, note: 'belt' });
    check('edit weight, reps and note together', ed.weight === 25 && ed.reps === 10 && ed.note === 'belt');
    check('clear the weight for a bodyweight set', (await api('PATCH', `/api/log/sets/${many[0].id}`, { weight: null })).weight === null);
    for (const m of many) await api('DELETE', `/api/log/sets/${m.id}`);
    check('edit a missing set 404', await throws(() => api('PATCH', '/api/log/sets/99999', { weight: 1 }), 404));
    check('PR is the best set', (await api('GET', '/api/gym/prs')).find(p => p.exercise === 'Bench Press').weight === 105);
    await api('DELETE', `/api/log/sets/${s1.id}`);
    check('delete a set', (await api('GET', '/api/log/2026-11-10')).sessions[0].sets === 1);
    check('delete a session', (await api('DELETE', `/api/log/sessions/${t}`)).removed === 1 && (await api('GET', '/api/log/2026-11-10')).sessions.length === 0);
    // the workouts editor
    await api('POST', '/api/log/sets', { session_ms: t, workout: 'Push', exercise: 'Bench Press', weight: 100, reps: 10 });
    const w = await api('PUT', '/api/workouts/Push', { rename: 'Push Day', exercises: [{ exercise: 'Incline Press', target_sets: 4, target_reps: 8 }, { exercise: 'Dips' }, { exercise: 'incline press' }] });
    check('rename and reorder a workout, duplicates dropped', w.workout === 'Push Day' && eq(w.exercises.map(e => e.exercise), ['Incline Press', 'Dips']) && w.exercises[0].note === '4 sets of 8');
    check('the rotation and the history follow the rename', E.get(S, 'lift_rotation') === 'Push Day,Pull,Legs,Push Day,Pull,Legs,Rest' && (await api('GET', '/api/gym/sessions')).sessions[0].workout === 'Push Day');
    await api('DELETE', '/api/workouts/' + encodeURIComponent('Push Day'));
    check('delete a workout', !(await api('GET', '/api/workouts')).some(x => x.workout === 'Push Day'));
  });

  await section('5. Forecast', async () => {
    const { S, api } = fresh();
    setNow('2026-11-20');
    await api('PATCH', '/api/settings', { start_weight: 280, target_weight: 180, start_date: '2026-11-12', age: 58, height_in: 71, lift_rotation: 'Push,Pull,Legs,Push,Pull,Legs,Rest' });
    let f = await api('GET', '/api/forecast');
    const a = f.assumptions;
    check('no plan: 2,000 kcal; six lifting days from the rotation', a.intake === 2000 && a.workouts_per_week === 6 && a.age === 58);
    check('a deficit and a downward line to the target', f.deficit_per_day > 0 && f.forecast[0].weight === 280 && f.forecast[f.forecast.length - 1].weight <= 180 && f.target_date);
    check('the line only goes down', f.forecast.every((p, i) => !i || p.weight <= f.forecast[i - 1].weight));
    await api('POST', '/api/weight', { date: '2026-11-19', weight: 274 });
    f = await api('GET', '/api/forecast');
    check('from the latest weigh-in', f.from_latest && f.from_latest[0].weight === 274 && typeof f.ahead_lb === 'number');
    await api('PATCH', '/api/settings', { target_date: '2027-12-31' });
    f = await api('GET', '/api/forecast');
    check('a date goal: goal line and what it takes', f.goal_line.length === 2 && f.needed_lb_per_week > 0 && f.fit && typeof f.fit.feasible_now === 'boolean');
    if (f.fit.activity.feasible) {
      f = await api('POST', '/api/forecast/fit', { mode: 'activity' });
      check('fit the activity to the date', f.on_track && Number(E.get(S, 'walk_min_per_week')) + Number(E.get(S, 'bike_min_per_week')) >= 0);
    }
    check('schedule for the week: what Monday to Thursday missed moves to Friday through Sunday', f.schedule.length === 7 && f.schedule[0].items[0].status === 'missed' && f.schedule[6].items[0].status === 'planned');
    // the week follows what was done
    const sched = E.schedule(Object.assign({}, a, { walk_min_per_week: 0, bike_min_per_week: 0, lift_rotation: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'] }), 290);
    const aa = Object.assign({}, a, { lift_rotation: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'] });
    const lifts = wk => wk.map(d => d.items.find(x => x.what === 'Lift') || null);
    let L = lifts(E.adaptWeek(aa, sched, { 0: ['Push'], 1: ['Pull'], 2: ['Legs'], 3: ['Push'], 4: ['Legs'] }, 4));
    check('Legs on a Pull day stays Legs; Saturday picks up the Pull', L[4].workout === 'Legs' && L[4].status === 'done' && L[5].workout === 'Pull' && L[5].status === 'planned' && L[6] === null);
    L = lifts(E.adaptWeek(aa, sched, {}, 1));
    check('skipped Monday: missed, all six still fit', L[0].status === 'missed' && L[0].kcal === 0 && eq(L.slice(1).map(x => x.workout), ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']));
    L = lifts(E.adaptWeek(aa, sched, {}, -3));
    check('a future week is the rotation', eq(L.map(x => x ? x.workout : null), ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', null]));
    check('fit with no date is refused', await throws(() => fresh().api('POST', '/api/forecast/fit', { mode: 'activity' })));
  });

  await section('6. Blog and dashboard', async () => {
    const { S, api } = fresh();
    setNow('2026-11-12');
    await api('PATCH', '/api/settings', { start_weight: 280, target_weight: 180, start_date: '2026-11-10' });
    await api('POST', '/api/weight', { date: '2026-11-10', weight: 280 });
    await api('POST', '/api/weight', { date: '2026-11-12', weight: 277.5 });
    await api('POST', '/api/log/sets', { session_ms: ms('2026-11-12', 9), workout: 'Push', exercise: 'Bench Press', weight: 135, reps: 8 });
    let p = await api('GET', '/api/blog/2026-11-12');
    check('title from the numbers', p.title === 'Day 3: 277.5 lb, Push', p.title);
    check('body lines', p.body_md.includes('**Scale:** 277.5 lb. Down 2.5 from Tuesday, November 10, 2026.') && p.body_md.includes('**Training:** Push. 1 sets, 1,080 lb moved.') && p.body_md.includes('workout 1 of 6'), p.body_md);
    check('a rest day reads sensibly', (await api('GET', '/api/blog/2026-11-11')).body_md.includes('no weigh-in today'));
    p = await api('PUT', '/api/blog/2026-11-12', { commentary: 'Felt strong.\n\n- slept 8 hours', title: 'Back under 278' });
    check('commentary and a custom title', p.title === 'Back under 278' && p.markdown.includes('## In my own words'));
    const list = await api('GET', '/api/blog');
    check('posts newest first', eq(list.map(x => x.date), ['2026-11-12', '2026-11-10']) && list[0].commentary === true);
    const site = await api('POST', '/api/blog/publish');
    check('publish makes one page', site.posts === 2 && site.html.includes('Back under 278') && site.html.includes('<li>slept 8 hours</li>') && (await api('GET', '/api/blog/2026-11-12')).published_at);
    await api('POST', '/api/bp', { taken_at: '2026-11-12T07:00', systolic: 130, diastolic: 85 });
    const s = await api('GET', '/api/summary');
    check('dashboard', s.weight.current === 277.5 && s.bp.latest.systolic === 130 && s.gym.last_session.workout === 'Push' && s.day_no === 3 && s.today_schedule.items && s.has_my_code === false);
    await api('PATCH', '/api/me', { name: 'Test' });
    check('me', eq(await api('GET', '/api/me'), { email: '', name: 'Test', setup_done: false }));
    check('unknown settings keys are ignored', !('bring_password' in (await api('PATCH', '/api/settings', { bring_password: 'x' }))));
    check('unknown route 404', await throws(() => api('GET', '/api/nope'), 404));
  });

  await section('7. Imports', async () => {
    const SQL = await require('sql.js')();
    // a Gym ACE database, the shape of the real one
    const g = new SQL.Database();
    g.run(`CREATE TABLE Exercises(Id INTEGER PRIMARY KEY, Name TEXT NOT NULL);
      CREATE TABLE Workouts(Id INTEGER PRIMARY KEY, Name TEXT NOT NULL);
      CREATE TABLE Sets(Id INTEGER PRIMARY KEY, Date INTEGER, SessionDate INTEGER, Weight TEXT, Reps TEXT, Note TEXT, ExerciseId INTEGER, WorkoutId INTEGER);
      CREATE TABLE WorkoutsExercises(WorkoutId INTEGER, ExerciseId INTEGER, "Order" INTEGER, Type INTEGER, Note TEXT);
      INSERT INTO Exercises VALUES (20, 'Bench Press Dumbbell'), (29, 'Alternate Hammer Curl');
      INSERT INTO Workouts VALUES (2, 'Push Days');
      INSERT INTO WorkoutsExercises VALUES (2, 20, 0, 0, '5 Sets of 10 Reps'), (2, 29, 1, 0, '');
      INSERT INTO Sets VALUES (1, ${ms('2026-11-12', 9) + 1000}, ${ms('2026-11-12', 9)}, '35', '10', '', 20, 2), (2, ${ms('2026-11-12', 9) + 2000}, ${ms('2026-11-12', 9)}, '40', '8', '', 20, 2),
        (3, ${ms('2026-11-12', 9) + 3000}, ${ms('2026-11-12', 9)}, '25', '12', '', 29, 2), (4, ${ms('2026-11-05', 9) + 1000}, ${ms('2026-11-05', 9)}, '30,5', '10', '', 20, 2);`);
    const { S, api } = fresh();
    await E.seedDefaultWorkouts(S);
    await api('POST', '/api/log/sets', { session_ms: ms('2026-11-13'), workout: 'Push', exercise: 'Bench Press', weight: 100, reps: 10 });
    check('knows a Gym ACE file', E.kindOf(g) === 'gymace');
    let r = await E.importGymAce(S, g);
    check('first import: 4 sets, logged set kept', r.imported === 4 && r.total_sets === 5 && r.sessions === 3, r);
    check('comma decimals read', S.db.gym_sets.some(s => s.weight === 30.5));
    const tpl = (await api('GET', '/api/gym/workouts')).find(w => w.workout === 'Push Days');
    check('Gym ACE template added, ours kept', tpl && eq(tpl.exercises.map(e => e.exercise), ['Bench Press Dumbbell', 'Alternate Hammer Curl']) && (await api('GET', '/api/workouts')).some(w => w.workout === 'Push'));
    check('targets read from the Gym ACE note', (await api('GET', '/api/workouts')).find(w => w.workout === 'Push Days').exercises[0].target_sets === 5);
    r = await E.importGymAce(S, g);
    check('again: nothing new', r.imported === 0 && r.updated === 0 && r.removed === 0 && r.total_sets === 5);
    g.run(`UPDATE Sets SET Weight = '45' WHERE Id = 2; DELETE FROM Sets WHERE Id = 3; INSERT INTO Sets VALUES (5, ${ms('2026-11-12', 9) + 4000}, ${ms('2026-11-12', 9)}, '45', '6', '', 20, 2);`);
    r = await E.importGymAce(S, g);
    check('edits, deletions and additions mirror', r.imported === 1 && r.updated === 1 && r.removed === 1 && r.total_sets === 5, r);
    check('the bench PR follows', (await api('GET', '/api/gym/prs')).find(p => p.exercise === 'Bench Press Dumbbell').weight === 45);

    // the old app's database, its schema as the Python app left it
    const o = new SQL.Database();
    o.run(`CREATE TABLE settings(key TEXT PRIMARY KEY, value TEXT);
      CREATE TABLE weight_log(id INTEGER PRIMARY KEY, date TEXT, weight REAL, note TEXT);
      CREATE TABLE bp_log(id INTEGER PRIMARY KEY, taken_at TEXT, systolic INTEGER, diastolic INTEGER, pulse INTEGER, context TEXT, note TEXT);
      CREATE TABLE foods(id INTEGER PRIMARY KEY, name TEXT, category TEXT, light TEXT, carbs_per_serving REAL, serving TEXT, store_section TEXT, unlocked INTEGER, note TEXT, kcal_100 REAL, protein_100 REAL, fat_100 REAL, carbs_100 REAL, unit_grams TEXT);
      CREATE TABLE meals(id INTEGER PRIMARY KEY, name TEXT, meal_type TEXT, portable INTEGER, batch INTEGER, instructions TEXT, enabled INTEGER);
      CREATE TABLE plans(id INTEGER PRIMARY KEY, week_start TEXT, created_at TEXT);
      CREATE TABLE plan_days(id INTEGER PRIMARY KEY, plan_id INTEGER, date TEXT, away INTEGER);
      CREATE TABLE plan_slots(id INTEGER PRIMARY KEY, plan_day_id INTEGER, slot TEXT, meal_id INTEGER);
      CREATE TABLE shopping_checks(plan_id INTEGER, food_id INTEGER, checked INTEGER);
      CREATE TABLE gym_sets(id INTEGER PRIMARY KEY, gymace_id INTEGER, session_ms INTEGER, set_ms INTEGER, date TEXT, workout TEXT, exercise TEXT, weight REAL, reps INTEGER, note TEXT);
      CREATE TABLE gym_workouts(workout TEXT, exercise TEXT, ord INTEGER, note TEXT);
      CREATE TABLE blog_posts(id INTEGER PRIMARY KEY, date TEXT, title TEXT, commentary TEXT, published_at TEXT, updated_at TEXT);
      INSERT INTO settings VALUES ('start_weight', '280'), ('target_weight', '180'), ('bring_password', 'secret'), ('gymace_db_path', 'C:/x'), ('lift_rotation', 'Push Days,Pull Days,Legs,Push Days,Pull Days,Legs,Rest');
      INSERT INTO weight_log VALUES (1, '2026-11-12', 280, ''), (2, '2026-11-13', 278.6, '');
      INSERT INTO bp_log VALUES (1, '2026-11-12T07:00', 138, 88, 72, 'morning', '');
      INSERT INTO foods VALUES (1, 'Eggs', 'eggs', 'green', 0.6, '2', 'Dairy & Eggs', 1, '', 143, 12.6, 9.5, 0.7, '{"egg": 50}'), (2, 'Ribeye steak', 'meat', 'green', 0, '8 oz', 'Meat', 1, '', 0, 0, 0, 0, '{}'),
        (3, 'Blueberries', 'fruit', 'yellow', 9, '1/2 cup', 'Produce', 1, 'ok in small amounts', 0, 0, 0, 0, '{}'), (4, 'Moose', 'meat', 'green', 0, '6 oz', 'Meat', 1, '', 130, 25, 3, 0, '{}');
      INSERT INTO meals VALUES (10, 'Sausage patties and eggs', 'breakfast', 0, 0, '', 1), (11, 'Ribeye with asparagus', 'dinner', 0, 0, '', 1), (12, 'Egg salad', 'lunch', 1, 0, '', 0), (13, 'Gone meal', 'lunch', 0, 0, '', 1);
      INSERT INTO plans VALUES (1, '2026-11-09', '2026-11-12T08:00:00');
      INSERT INTO plan_days VALUES (100, 1, '2026-11-13', 1);
      INSERT INTO plan_slots VALUES (1, 100, 'breakfast', 10), (2, 100, 'lunch', 13), (3, 100, 'dinner', 11), (4, 100, 'snack1', NULL), (5, 100, 'snack2', NULL);
      INSERT INTO shopping_checks VALUES (1, 1, 1), (1, 2, 1), (1, 3, 0);
      INSERT INTO gym_sets VALUES (1, 77, ${ms('2026-11-12', 9)}, ${ms('2026-11-12', 9) + 1}, '2026-11-12', 'Push Days', 'Bench', 100, 5, ''), (2, NULL, ${ms('2026-11-13', 9)}, ${ms('2026-11-13', 9) + 1}, '2026-11-13', 'Legs', 'Squat', 135, 8, '');
      INSERT INTO gym_workouts VALUES ('Push Days', 'Bench', 0, '5 Sets of 10 Reps');
      INSERT INTO blog_posts VALUES (1, '2026-11-12', NULL, 'Day one.', NULL, '2026-11-12T20:00:00');`);
    check('knows an old-app file', E.kindOf(o) === 'old');
    r = await E.importOldApp(S, o);
    check('everything comes over, replacing what was there', r.weigh_ins === 2 && r.bp === 1 && r.plans === 1 && r.sets === 2 && r.workouts === 1 && r.posts === 1, r);
    check('logged sets and Gym ACE ids kept', S.db.gym_sets.some(s => s.gymace_id === 77) && S.db.gym_sets.some(s => s.gymace_id === null && s.exercise === 'Squat'));
    check('settings come over; old paths and the Bring! password do not', E.get(S, 'start_weight') === '280' && E.get(S, 'setup_done') === '1' && !S.db.settings.some(x => /bring|gymace_db_path/.test(x.key)));
    const plan = E.getPlan(S, S.db.plans[0].id);
    const d = plan.days[0];
    check('plan slots matched by name; renamed meals followed; missing ones empty', d.slots[0].meal_id === 'sausage-patties-and-eggs' && d.slots[2].meal_id === 'sirloin-with-asparagus' && d.slots[1].meal_id === null && r.slots_without_meal === 1 && d.away === 1, d.slots.map(s => s.meal_id));
    check('shopping checks follow the foods', eq(S.db.plans[0].checks, { eggs: true, 'sirloin-steak': true }));
    check('a meal turned off stays off', E.mealMap(S)['egg-salad'].enabled === false);
    check('food changes kept: yellow unlocked with its note', E.foodMap(S).blueberries.unlocked === true && E.foodMap(S).blueberries.note === 'ok in small amounts');
    check("a food the library lacks becomes the person's own", E.foods(S).some(f => f.custom && f.name === 'Moose' && f.kcal_100 === 130));
    check('the blog note comes over', S.db.blog_posts[0].commentary === 'Day one.');
  });

  await section('8. Daily check-in and the goals', async () => {
    const { S, api } = fresh();
    setNow('2026-11-15');
    await api('PATCH', '/api/settings', { start_weight: 280, target_weight: 180, start_date: '2026-11-10' });
    let c = await api('GET', '/api/checkins');
    check('an empty day', c.date === '2026-11-15' && c.today.energy === null && c.today.water_oz === 0 && c.avg7.days === 0);
    check('water goal 100 oz; protein goal 1 g per pound of the target', c.water_goal === 100 && c.protein_goal === 180 && c.protein_goal_own === false, [c.water_goal, c.protein_goal]);
    c = await api('PUT', '/api/checkins/2026-11-15', { energy: 7, focus: 6, mood: 8, sleep_hours: 7.5, habits: { sunlight: true, no_alcohol: true, made_up: true } });
    check('scores, sleep and habits saved; unknown habits dropped', c.today.energy === 7 && c.today.sleep_hours === 7.5 && eq(c.today.habits, { sunlight: true, no_alcohol: true }), c.today);
    c = await api('POST', '/api/checkins/2026-11-15/water', { add: 16 });
    c = await api('POST', '/api/checkins/2026-11-15/water', { add: 16 });
    check('water adds up and keeps the scores', c.today.water_oz === 32 && c.today.energy === 7, c.today);
    c = await api('POST', '/api/checkins/2026-11-15/water', { add: -100 });
    check('water never goes below zero', c.today.water_oz === 0);
    await api('PUT', '/api/checkins/2026-11-14', { energy: 5, sleep_hours: 6, water_oz: 80 });
    c = await api('GET', '/api/checkins?date=2026-11-15');
    check('seven-day averages and habit days', c.avg7.days === 2 && c.avg7.energy === 6 && c.avg7.sleep_hours === 6.8 && c.habits.find(h => h.key === 'sunlight').days === 1, c.avg7);
    check('a score out of range is refused', await throws(() => api('PUT', '/api/checkins/2026-11-15', { mood: 11 }), 422));
    c = await api('PUT', '/api/checkins/2026-11-15', { mood: null });
    check('a score can be cleared', c.today.mood === null && c.today.energy === 7);
    await api('PATCH', '/api/settings', { water_goal_oz: 120, protein_goal_g: 200 });
    check('own goals win', eq(await api('GET', '/api/goals'), { water_oz: 120, protein_g: 200 }));
    await api('POST', '/api/checkins/2026-11-15/water', { add: 64 });
    const post = await api('GET', '/api/blog/2026-11-15');
    check('the post has the check-in', post.body_md.includes('**Check-in:** Energy 7, focus 6 out of 10. 7.5 hours of sleep. 64 of 120 oz of water. Kept: 10 minutes of sun within an hour of waking; no alcohol.'), post.body_md);
    check('a check-in day is a post day', (await api('GET', '/api/blog')).some(x => x.date === '2026-11-14'));
    const s = await api('GET', '/api/summary');
    check('the dashboard has the check-in and goals', s.checkin.water_oz === 64 && s.water_goal === 120 && s.protein_goal === 200);
    await api('DELETE', '/api/checkins/2026-11-14');
    check('a check-in can be deleted', !S.db.checkins.some(x => x.date === '2026-11-14'));
  });

  await section('9. Shopping for one week or several', async () => {
    const { S, api } = fresh();
    await E.seedDefaultWorkouts(S);
    const a = await api('POST', '/api/plans', { week_start: '2026-11-16' });
    const b = await api('POST', '/api/plans', { week_start: '2026-11-23' });
    const empty = await api('POST', '/api/plans', { week_start: '2026-11-30' });
    for (const d of E.getPlan(S, empty.id).days) for (const sl of d.slots) await api('PATCH', `/api/plans/slots/${sl.id}`, { meal_id: null });
    const weeks = await api('GET', '/api/shopping/weeks');
    check('only weeks with meals are offered, in order', eq(weeks.map(w => w.week_start), ['2026-11-16', '2026-11-23']) && weeks[0].week_end === '2026-11-22' && weeks[0].meals > 0, weeks);
    check('a week with no meals is refused', await throws(() => api('GET', `/api/shopping?plans=${empty.id}`), 422));
    check('no weeks picked is refused', await throws(() => api('GET', '/api/shopping?plans='), 422));
    const one = await api('GET', `/api/shopping?plans=${a.id}`), two = await api('GET', `/api/shopping?plans=${b.id}`);
    const both = await api('GET', `/api/shopping?plans=${a.id},${b.id}`);
    const flat = g => Object.fromEntries(g.flatMap(x => x.items).map(i => [i.food_id + '|' + i.unit, i.qty]));
    const f1 = flat(one), f2 = flat(two), fb = flat(both);
    check('two weeks add up item by item', Object.keys(fb).every(k => Math.abs(fb[k] - ((f1[k] || 0) + (f2[k] || 0))) < 0.011) && Object.keys(fb).length >= Math.max(Object.keys(f1).length, Object.keys(f2).length));
    const food = Object.keys(fb).map(k => k.split('|')[0]).find(id => Object.keys(f1).some(k => k.startsWith(id + '|')) && Object.keys(f2).some(k => k.startsWith(id + '|')));   // an item both weeks use
    let after = await api('PATCH', `/api/shopping/${food}`, { plans: [a.id, b.id], checked: true });
    check('checking on the combined list checks it in both weeks', after.flatMap(g => g.items).find(i => i.food_id === food).checked === 1 && E.plan(S, a.id).checks[food] && E.plan(S, b.id).checks[food]);
    await api('PATCH', `/api/plans/${b.id}/shopping/${food}`, { checked: false });
    after = await api('GET', `/api/shopping?plans=${a.id},${b.id}`);
    check('checked only in one week shows unchecked on the combined list', after.flatMap(g => g.items).find(i => i.food_id === food).checked === 0);
    check('the one-week route still works', (await api('GET', `/api/plans/${a.id}/shopping`)).length > 0);
  });

  await section('10. Diets', async () => {
    const { S, api } = fresh();
    const TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
    check('low-carb is the default', E.diet(S) === 'lowcarb' && (await api('GET', '/api/diets')).diets.find(d => d.current).id === 'lowcarb');
    const counts = {};
    for (const d of E.DIETS) {
      await api('PATCH', '/api/settings', { diet: d.id });
      const ok = E.allowedMeals(S);
      counts[d.id] = Object.fromEntries(TYPES.map(t => [t, ok.filter(m => m.meal_type === t).length]));
      check(`${d.name}: at least 4 of every meal type`, TYPES.every(t => counts[d.id][t] >= 4), counts[d.id]);
      const plan = await api('POST', '/api/plans', { week_start: '2026-11-16', replace: true });
      check(`${d.name}: a full week plans with no empty slots`, plan.days.every(x => x.slots.every(sl => sl.meal_id)), plan.days.map(x => x.slots.filter(sl => !sl.meal_id).map(sl => sl.slot)));
      const fm = E.foodMap(S), mm = E.mealMap(S);
      check(`${d.name}: every planned food is allowed`, plan.days.every(x => x.slots.every(sl => mm[sl.meal_id].ingredients.every(i => fm[i.food_id].light !== 'red' && fm[i.food_id].unlocked))));
    }
    await api('PATCH', '/api/settings', { diet: 'carnivore' });
    let fm = E.foodMap(S);
    check('carnivore: steak and eggs green, broccoli and rice red', fm['sirloin-steak'].light === 'green' && fm.eggs.light === 'green' && fm.broccoli.light === 'red' && fm['white-rice'].light === 'red');
    await api('PATCH', '/api/settings', { diet: 'clean' });
    fm = E.foodMap(S);
    check('whole-food reset: rice, potatoes, fruit in; mayo, deli ham, diet soda out', fm['white-rice'].light === 'green' && fm.potatoes.light === 'green' && fm.banana.light === 'green' && fm.mayonnaise.light === 'red' && fm['deli-ham'].light === 'red' && fm['diet-soda'].light === 'red');
    await api('PATCH', '/api/settings', { diet: 'keto' });
    const macros = E.mealMacros(S);
    check('keto: every meal under 10 g net carbs, snacks under 5', E.allowedMeals(S).every(m => macros[m.id].carbs <= (m.meal_type === 'snack' ? 5 : 10)));
    await api('PATCH', '/api/settings', { diet: 'mediterranean' });
    fm = E.foodMap(S);
    check('Mediterranean: red meat starts locked; fish, beans and rice in; salami out', fm['sirloin-steak'].light === 'yellow' && !fm['sirloin-steak'].unlocked && fm['salmon-fillet'].light === 'green' && fm.beans.light === 'green' && fm['white-rice'].light === 'green' && fm.salami.light === 'red');
    await api('PATCH', '/api/foods/sirloin-steak', { unlocked: true });
    check('your own unlock still wins under a diet', E.foodMap(S)['sirloin-steak'].unlocked === true);
    const meals = await api('GET', '/api/meals');
    check('the recipe list says which fit', meals.some(m => m.allowed) && meals.some(m => !m.allowed) && meals.find(m => m.id === 'cod-with-tomatoes-and-olives').allowed);
    await api('PATCH', '/api/settings', { diet: 'nonsense' });
    check('an unknown diet falls back to low-carb', E.diet(S) === 'lowcarb');
  });

  await section('11. AI core (stand-in providers, nothing sent)', async () => {
    const core = await import(require('url').pathToFileURL(path.join(root, 'supabase/functions/ai/core.js')).href);
    check('keys recognized by their start', eq(['sk-ant-x', 'xai-x', 'gsk_x', 'AIzaX', 'sk-proj-x', 'nope'].map(core.detectProvider), ['anthropic', 'xai', 'groq', 'gemini', 'openai', null]));
    check('low tier: Claude Haiku; cheapest capable elsewhere', core.modelFor(core.defaults({}), 'anthropic') === 'claude-haiku-5-5' &&
      core.pickModel('groq', ['whisper-large-v3', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'], 'low') === 'openai/gpt-oss-20b' &&
      core.pickModel('gemini', ['x-pro', 'x-flash', 'x-flash-lite', 'text-embedding'], 'low') === 'x-flash-lite');
    const cfg = core.defaults({ provider: 'anthropic', keys: { anthropic: 'sk-ant-secret-1234' } });
    const pub = core.publicConfig(cfg, null);
    check('the setup page never sees a key', pub.configured && !JSON.stringify(pub).includes('sk-ant-secret') && pub.providers.find(p => p.id === 'anthropic').key_hint === '…1234');
    const calls = [];
    const deps = { anthropic: async (params) => { calls.push(JSON.parse(JSON.stringify(params))); return calls.length === 1
      ? { stop_reason: 'tool_use', usage: { input_tokens: 100, output_tokens: 20 }, content: [{ type: 'text', text: 'Down 2 lb.' },
          { type: 'tool_use', id: 't1', name: 'suggest_change', input: { setting: 'daily_kcal', value: '1850', why: 'pace' } },
          { type: 'tool_use', id: 't2', name: 'suggest_change', input: { setting: 'daily_kcal', value: '200', why: 'x' } }] }
      : { stop_reason: 'end_turn', usage: { input_tokens: 50, output_tokens: 10 }, content: [{ type: 'text', text: 'It is there to apply.' }] }; } };
    const out = await core.runTurn(cfg, 'coach', [{ role: 'assistant', content: 'hi' }, { role: 'user', content: 'How am I doing?' }], { w: 1 }, { today: '2026-11-17' }, deps);
    check('a Claude turn: replies, one good card, the bad one sent back as an error', eq(out.replies, ['Down 2 lb.', 'It is there to apply.']) && out.cards.length === 1 && out.cards[0].input.value === '1850' &&
      calls[1].messages.at(-1).content[1].is_error === true && out.usage.tokens_in === 150);
    check('the request: Haiku at low effort, short replies, history starts with the person, fresh context last', calls[0].model === 'claude-haiku-5-5' && calls[0].output_config.effort === 'low' && !calls[0].fallbacks &&
      calls[0].max_tokens === 4000 && calls[0].messages[0].role === 'user' && calls[0].messages.at(-1).role === 'system');
    const best = core.defaults({ provider: 'anthropic', tier: 'best', keys: { anthropic: 'sk-ant-k' } }); calls.length = 0;
    await core.runTurn(best, 'mycode', [{ role: 'user', content: 'go' }], {}, {}, { anthropic: async (p) => { calls.push(p); return { stop_reason: 'end_turn', content: [{ type: 'text', text: 'ok' }] }; } });
    check('best tier: Opus with the refusal fallback', calls[0].model === 'claude-opus-5-5' && calls[0].fallbacks === 'default');
    const groq = core.defaults({ provider: 'groq', models: { groq: 'm-70b' }, keys: { groq: 'gsk_k' } }); const posts = [];
    const r2 = await core.runTurn(groq, 'kitchen', [{ role: 'user', content: 'ideas?' }], { foods: [] }, { foodIds: new Set(['eggs', 'bacon', 'bread']), offIds: new Set(['bread']) }, {
      fetchJson: async (url, key, body) => { posts.push({ url, key, body: JSON.parse(JSON.stringify(body)) }); return posts.length === 1
        ? { choices: [{ finish_reason: 'tool_calls', message: { content: '', tool_calls: [
            { id: 'a', function: { name: 'create_recipe', arguments: JSON.stringify({ name: 'Bacon and eggs', meal_type: 'breakfast', portable: false, batch: false, instructions: 'Fry.', ingredients: [{ food_id: 'eggs', qty: 3, unit: 'egg' }, { food_id: 'bacon', qty: 2, unit: 'slice' }] }) } },
            { id: 'b', function: { name: 'create_recipe', arguments: JSON.stringify({ name: 'Toast', meal_type: 'breakfast', portable: false, batch: false, instructions: '', ingredients: [{ food_id: 'bread', qty: 2, unit: 'slice' }] }) } },
            { id: 'c', function: { name: 'set_food_preference', arguments: '{"food_id": "tofu", "choice": "dislike"}' } }] } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }
        : { choices: [{ finish_reason: 'stop', message: { content: 'Two recipes below.' } }] }; } });
    check('an OpenAI-style turn (Groq): one recipe passes, off-diet and unknown foods are sent back', posts[0].url === 'https://api.groq.com/openai/v1/chat/completions' && posts[0].key === 'gsk_k' &&
      r2.cards.length === 1 && r2.cards[0].input.name === 'Bacon and eggs' && posts[1].body.messages.filter(m => m.role === 'tool').map(m => m.content.startsWith('Error')).join() === 'false,true,true');
    const ownerCfg = { provider: 'groq', keys: { groq: 'gsk_owner_key' }, models: { groq: 'm' }, daily_limit: 25 };
    const mine = { provider: 'gemini', keys: { gemini: 'AIza-mine' }, models: { gemini: 'x-flash' } };
    const o = core.chooseConfig({ owner: true, invited: false, ownerCfg, userCfg: mine }), inv = core.chooseConfig({ owner: false, invited: true, ownerCfg, userCfg: mine });
    const own = core.chooseConfig({ owner: false, invited: false, ownerCfg, userCfg: mine }), none = core.chooseConfig({ owner: false, invited: false, ownerCfg, userCfg: null });
    check("whose key: the owner and invited people use the owner's (invited under the limit); self-signed-up people their own, never the owner's",
      o.mode === 'owner' && !o.limited && o.cfg.keys.groq === 'gsk_owner_key' && inv.mode === 'invited' && inv.limited && inv.cfg.keys.groq === 'gsk_owner_key' &&
      own.mode === 'own' && !own.limited && own.cfg.provider === 'gemini' && !own.cfg.keys.groq && own.cfg.daily_limit === 0 &&
      none.mode === 'own' && !core.configured(none.cfg) && !JSON.stringify(none.cfg).includes('gsk_owner_key'));
    let threw = false; try { await core.runTurn(core.defaults({}), 'coach', [{ role: 'user', content: 'x' }], {}, {}, {}); } catch (e) { threw = e.status === 503; }
    check('not set up: a clear 503', threw);
  });

  await section('12. Kitchen, recipes and the AI routes in the app', async () => {
    const { S, api } = fresh();
    setNow('2026-11-17');
    await api('PATCH', '/api/settings', { start_weight: 280, target_weight: 180, start_date: '2026-11-10', setup_done: '1' });
    await api('PUT', '/api/kitchen/prefs/salmon-fillet', { choice: 'like' });
    let k = await api('PUT', '/api/kitchen/prefs/shrimp', { choice: 'allergy' });
    check('likes and allergies recorded; an allergy turns the food red', k.prefs.length === 2 && E.foodMap(S).shrimp.light === 'red' && E.likedFoods(S).has('salmon-fillet'));
    await api('PUT', '/api/kitchen/prefs/shrimp', { choice: 'none' });
    check('none undoes it', E.foodMap(S).shrimp.light === 'green' && !E.prefs(S).shrimp);
    check('an unknown food or choice is refused', await throws(() => api('PUT', '/api/kitchen/prefs/unicorn', { choice: 'like' }), 404) && await throws(() => api('PUT', '/api/kitchen/prefs/eggs', { choice: 'love' }), 422));
    check('no pantry: planning from it is refused', await throws(() => api('POST', '/api/plans', { week_start: '2026-11-23', pantry_from: 'kitchen' }), 409));
    for (const f of ['eggs', 'bacon', 'butter', 'ground-beef-80-20', 'cheddar-cheese', 'sirloin-steak', 'string-cheese']) await api('PUT', `/api/kitchen/pantry/${f}`, { on: true });
    const m = await api('POST', '/api/meals/custom', { name: 'Cheesy beef scramble', meal_type: 'breakfast', instructions: 'Brown, scramble.', ingredients: [{ food_id: 'ground-beef-80-20', qty: 4, unit: 'oz' }, { food_id: 'eggs', qty: 3, unit: 'egg' }, { food_id: 'cheddar-cheese', qty: 1, unit: 'oz' }] });
    check('a recipe of your own joins the library with its macros', m.id.startsWith('u-meal-cheesy-beef-scramble') && E.mealMap(S)[m.id].custom && E.mealMacros(S)[m.id].protein > 40);
    check('a recipe with an unknown food or unweighable unit is refused', await throws(() => api('POST', '/api/meals/custom', { name: 'X', meal_type: 'lunch', ingredients: [{ food_id: 'unicorn', qty: 1, unit: 'oz' }] }), 422) &&
      await throws(() => api('POST', '/api/meals/custom', { name: 'Y', meal_type: 'lunch', ingredients: [{ food_id: 'eggs', qty: 1, unit: 'bucket' }] }), 422) &&
      await throws(() => api('POST', '/api/meals/custom', { name: 'Cheesy beef scramble', meal_type: 'lunch', ingredients: [{ food_id: 'eggs', qty: 1, unit: 'egg' }] }), 409));
    const plan = await api('POST', '/api/plans', { week_start: '2026-11-23', pantry_from: 'kitchen' });
    const onHand = new Set([...E.pantry(S), ...E.STAPLES]), mm = E.mealMap(S);
    const bfast = plan.days.map(d => d.slots.find(s => s.slot === 'breakfast').meal_id);
    check('a week from what is on hand: breakfasts use only on-hand food, your own recipe among them', bfast.every(id => mm[id].ingredients.every(i => onHand.has(i.food_id))) && bfast.includes(m.id), bfast);

    // the conversations, with the AI service stood in
    let sent = null;
    HT.aiCall = async (body) => { sent = body; return body.kind === 'kitchen'
      ? { replies: ['Two ideas below.'], cards: [{ tool: 'set_food_preference', input: { food_id: 'cod-or-tilapia', choice: 'dislike' } },
          { tool: 'create_recipe', input: { name: 'Steak and cheddar plate', meal_type: 'dinner', portable: false, batch: false, instructions: 'Sear.', ingredients: [{ food_id: 'sirloin-steak', qty: 8, unit: 'oz' }, { food_id: 'cheddar-cheese', qty: 1, unit: 'oz' }] } }] }
      : body.kind === 'mycode' ? { replies: ['Draft below.'], cards: [{ tool: 'write_code', input: { eyebrow: 'Sam', title: 'My Code', sections: [{ heading: 'Why', lead: 'For my kids.', lines: [] }] } }] }
      : { replies: ['Down 2 lb.'], cards: [{ tool: 'suggest_change', input: { setting: 'daily_kcal', value: '1850', why: 'pace' } }] }; };
    let st = await api('POST', '/api/ai/kitchen', { message: 'I hate cod. Give me dinner ideas.' });
    check('kitchen: context has the food list and on-hand; ids sent for checking', sent.context.foods.length > 100 && sent.context.on_hand.includes('Eggs') && sent.food_ids.includes('eggs') && sent.off_ids.includes('shrimp') === false);
    const recipeCard = st.messages.at(-1).cards.find(c => c.tool === 'create_recipe');
    check('a stated dislike is applied at once; a recipe waits as a card', E.prefs(S)['cod-or-tilapia'] === 'dislike' && recipeCard.status === 'open');
    st = await api('POST', `/api/ai/cards/${recipeCard.id}/apply`);
    check('adding the recipe card puts it in your recipes', E.meals(S).some(x => x.custom && x.name === 'Steak and cheddar plate') && await throws(() => api('POST', `/api/ai/cards/${recipeCard.id}/apply`), 409));
    st = await api('POST', '/api/ai/coach', { message: 'How am I doing?' });
    check('coach: context has numbers and check-ins; the history starts with you', sent.context.weight && 'checkins_last_7_days' in sent.context && sent.history[0].role === 'user' && sent.history.at(-1).content === 'How am I doing?');
    const card = st.messages.at(-1).cards[0];
    await api('POST', `/api/ai/cards/${card.id}/apply`);
    check('applying the coach card changes the setting', E.get(S, 'daily_kcal') === '1850');
    st = await api('POST', '/api/ai/mycode', { message: 'Help me write my code.' });
    check('My Code: the draft is kept, not yet your code', st.draft.sections[0].lead === 'For my kids.' && st.code === null);
    st = await api('POST', '/api/mycode/save');
    check('make it your code', st.code.eyebrow === 'Sam' && st.saved_at === '2026-11-17');
    HT.aiCall = async () => { const e = new Error('limit of 25'); e.status = 429; throw e; };
    const before = S.db.ai_messages.length;
    check('when the service says no, nothing is stored', await throws(() => api('POST', '/api/ai/coach', { message: 'again' }), 429) && S.db.ai_messages.length === before);
    await api('DELETE', '/api/ai/coach');
    check('a new conversation clears the coach only', !S.db.ai_messages.some(x => x.kind === 'coach') && S.db.ai_messages.some(x => x.kind === 'kitchen'));
    delete HT.aiCall;
  });

  await section('13. Other training and the exercise library', async () => {
    const { S, api } = fresh();
    setNow('2026-11-18');
    await api('PATCH', '/api/settings', { start_weight: 290, target_weight: 180, start_date: '2026-11-10', setup_done: '1' });
    await api('POST', '/api/weight', { date: '2026-11-18', weight: 290 });
    const a = await api('POST', '/api/activities', { date: '2026-11-18', kind: 'pickleball', minutes: 60, intensity: 'moderate' });
    check('pickleball for an hour at 290 lb: about 480 kcal above resting', a.name === 'Pickleball' && a.kcal > 420 && a.kcal < 560, a.kcal);
    const hard = await api('POST', '/api/activities', { date: '2026-11-17', kind: 'walk', minutes: 30, intensity: 'hard', distance: 1.8 });
    const easy = E.activityKcal('walk', 30, 'easy', 290);
    check('harder burns more; distance kept', hard.kcal > easy && hard.distance === 1.8);
    await api('POST', '/api/activities', { date: '2026-11-16', kind: 'stretch', minutes: 10 });
    check('bad entries refused', await throws(() => api('POST', '/api/activities', { kind: 'flying', minutes: 30 }), 422) &&
      await throws(() => api('POST', '/api/activities', { kind: 'walk', minutes: 0 }), 422) && await throws(() => api('POST', '/api/activities', { kind: 'run', minutes: 30, distance: -2 }), 422));
    const wk = await api('GET', '/api/training/week/2026-11-18');
    const wed = wk.days[2].items.find(x => x.what === 'Activity');
    check('the week shows it on the day it was done', wed && wed.name === 'Pickleball' && wed.status === 'done' && wk.days[2].kcal >= a.kcal);
    check('20 minutes or more counts as a workout day; a 10-minute stretch does not', E.workoutDates(S).includes('2026-11-18') && E.workoutDates(S).includes('2026-11-17') && !E.workoutDates(S).includes('2026-11-16'));
    const post = await api('GET', '/api/blog/2026-11-18');
    check('the daily post mentions it', post.title.includes('pickleball') && post.body_md.includes('**Also:** Pickleball, 60 min'), post.body_md);
    check('the coach sees it', E.coachContext(S).other_training_last_14_days.length === 3);
    const list = await api('GET', '/api/activities?to=2026-11-18');
    check('the last two weeks, newest first', list.entries[0].kind === 'pickleball' && list.kinds.length > 20);
    await api('DELETE', `/api/activities/${a.id}`);
    check('delete an entry', !S.db.activities.some(x => x.id === a.id) && await throws(() => api('DELETE', `/api/activities/${a.id}`), 404));
    // the exercise library and its routines
    const lib = {}; new Function('window', fs.readFileSync(path.join(root, 'data/exercises.js'), 'utf8'))(lib);
    const X = lib.HT_EXERCISES, names = new Set(X.list.map(x => x[0]));
    check('the library: 100+ exercises, every one with a known group and equipment, no repeats', X.list.length >= 100 && names.size === X.list.length &&
      X.list.every(x => X.groups.includes(x[1]) && X.equipment.includes(x[2])), X.list.length);
    check('every routine uses library exercises with sets and reps', Object.values(X.routines).every(r => Object.values(r).every(ex => ex.every(e => names.has(e[0]) && e[1] > 0 && e[2] > 0))));
    for (const [w, ex] of Object.entries(X.routines['Upper / Lower'])) await api('PUT', `/api/workouts/${encodeURIComponent(w)}`, { exercises: ex.map(e => ({ exercise: e[0], target_sets: e[1], target_reps: e[2] })) });
    check('a routine becomes your workouts', (await api('GET', '/api/workouts')).some(w => w.workout === 'Upper' && w.exercises.length === 6));
  });

  console.log(failures ? `\n${failures} FAILED` : '\nAll checks pass.');
  process.exit(failures ? 1 : 0);
})();
