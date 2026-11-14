/* Weight Target checks: the engine and the API router over an in-memory store, the same code the pages run.
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
    check('122 foods and 49 meals', LIB.foods.length === 122 && LIB.meals.length === 49, [LIB.foods.length, LIB.meals.length]);
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

  console.log(failures ? `\n${failures} FAILED` : '\nAll checks pass.');
  process.exit(failures ? 1 : 0);
})();
