/* Weight Target: the app's API, answered in the browser. The pages call HT.api('/api/...') the way they
   called the old Python server; this router does the same work over the person's rows (engine.js) and
   writes through the store, so the pages hardly changed in the move to GitHub Pages and Supabase. */
(function (root) {
  'use strict';
  var HT = root.HT = root.HT || {};
  var E = HT.E;

  var routes = [];
  function on(method, pattern, fn) {
    var names = [];
    var re = new RegExp('^' + pattern.replace(/\{(\w+)\}/g, function (_, n) { names.push(n); return '([^/]+)'; }) + '$');
    routes.push({ method: method, re: re, names: names, fn: fn });
  }
  function num(v, name, lo, hi) {
    if (v === null || v === undefined || v === '') return null;
    var x = Number(v);
    if (isNaN(x) || (lo !== undefined && x < lo) || (hi !== undefined && x > hi)) throw E.bad(name + ' is out of range', 422);
    return x;
  }

  HT.route = async function (S, method, url, body) {
    var u = new URL(url, 'http://x'), path = decodeURIComponent(u.pathname);
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i], m = r.re.exec(u.pathname);
      if (r.method !== method || !m) continue;
      var p = {};
      r.names.forEach(function (n, j) { p[n] = decodeURIComponent(m[j + 1]); });
      return await r.fn(S, p, body || {}, u.searchParams);
    }
    throw E.bad('Not found: ' + method + ' ' + path, 404);
  };

  // ---------- me and settings ----------
  on('GET', '/api/me', function (S) {
    return { email: S.email || '', name: E.get(S, 'name'), setup_done: E.get(S, 'setup_done') === '1' };
  });
  on('PATCH', '/api/me', async function (S, p, b) {
    if (b.name != null) await E.set(S, 'name', String(b.name).trim().slice(0, 80));
    return HT.route(S, 'GET', '/api/me');
  });
  on('GET', '/api/settings', function (S) { return E.allSettings(S); });
  on('PATCH', '/api/settings', async function (S, p, b) {
    var rows = [];
    Object.keys(b).forEach(function (k) { if (E.SETTING_KEYS.indexOf(k) >= 0 && b[k] !== null && b[k] !== undefined) rows.push({ key: k, value: String(b[k]) }); });
    await S.upsert('settings', rows);
    return E.allSettings(S);
  });

  // ---------- weight ----------
  on('GET', '/api/weight', function (S) { return E.weightStats(S); });
  on('POST', '/api/weight', async function (S, p, b) {
    var ds = b.date || E.todayStr();
    E.parse(ds);
    var w = num(b.weight, 'weight', 50.0001, 799.9999);
    if (w === null) throw E.bad('weight is required', 422);
    var ex = S.db.weight_log.find(function (r) { return r.date === ds; });
    if (ex) await S.update('weight_log', { id: ex.id }, { weight: w, note: b.note || '' });
    else await S.insert('weight_log', { date: ds, weight: w, note: b.note || '' });
    return E.weightStats(S);
  });
  on('DELETE', '/api/weight/{id}', async function (S, p) { await S.remove('weight_log', { id: p.id }); return E.weightStats(S); });

  // ---------- blood pressure ----------
  on('GET', '/api/bp', function (S) { return E.bpStats(S); });
  on('POST', '/api/bp', async function (S, p, b) {
    var at = b.taken_at || E.nowIso().slice(0, 16);
    if (isNaN(new Date(at).getTime())) throw E.bad('taken_at must be a date and time', 422);
    var sys = num(b.systolic, 'systolic', 60, 260), dia = num(b.diastolic, 'diastolic', 30, 160), pulse = num(b.pulse, 'pulse', 30, 220);
    if (sys === null || dia === null) throw E.bad('systolic and diastolic are required', 422);
    await S.insert('bp_log', { taken_at: at, systolic: Math.round(sys), diastolic: Math.round(dia), pulse: pulse === null ? null : Math.round(pulse), context: b.context || 'morning', note: b.note || '' });
    return E.bpStats(S);
  });
  on('DELETE', '/api/bp/{id}', async function (S, p) { await S.remove('bp_log', { id: p.id }); return E.bpStats(S); });

  // ---------- gym and the log ----------
  on('GET', '/api/gym/workouts', function (S) { return E.workoutNames(S).map(function (w) { return { workout: w, exercises: E.workoutTemplate(S, w) }; }); });
  on('GET', '/api/gym/sessions', function (S) { return { sessions: E.sessions(S), last_sync: E.get(S, 'gymace_last_sync') }; });
  on('GET', '/api/gym/sessions/{ms}', function (S, p) { return E.sessionDetail(S, Number(p.ms)); });
  on('GET', '/api/gym/weekly', function (S) { return E.weeklyVolume(S); });
  on('GET', '/api/gym/prs', function (S) { return E.personalRecords(S); });
  on('GET', '/api/gym/exercise/{name}', function (S, p) { return E.exerciseHistory(S, p.name); });

  on('GET', '/api/log/{ds}', function (S, p) {
    E.parse(p.ds);
    var out = E.logDay(S, p.ds), a = E.assumptions(S);
    var sched = E.week(S, a, E.latestWeight(S, a), E.monday(p.ds), p.ds)[E.weekday(p.ds)];
    var lift = sched.items.find(function (x) { return x.what === 'Lift'; });
    out.planned = lift && lift.status === 'planned' ? lift.workout : null;
    return out;
  });
  on('POST', '/api/log/sets', async function (S, p, b) {
    if (!String(b.exercise || '').trim()) throw E.bad('exercise is required');
    num(b.weight, 'weight', 0, 2000); num(b.reps, 'reps', 0, 1000);
    if (!b.session_ms) throw E.bad('session_ms is required');
    return E.addSet(S, b);
  });
  on('PATCH', '/api/log/sets/{id}', async function (S, p, b) {
    if (!E.getSet(S, p.id)) throw E.bad('No such set', 404);
    var patch = {};
    if (b.weight != null) patch.weight = num(b.weight, 'weight', 0, 2000);
    if (b.reps != null) patch.reps = Math.round(num(b.reps, 'reps', 0, 1000));
    if (b.note != null) patch.note = String(b.note);
    if (b.exercise != null) patch.exercise = String(b.exercise).trim();
    if (Object.keys(patch).length) await S.update('gym_sets', { id: p.id }, patch);
    return E.getSet(S, p.id);
  });
  on('DELETE', '/api/log/sets/{id}', async function (S, p) { await S.remove('gym_sets', { id: p.id }); return { ok: true }; });
  on('DELETE', '/api/log/sessions/{ms}', async function (S, p) {
    var n = S.db.gym_sets.filter(function (s) { return String(s.session_ms) === String(p.ms); }).length;
    await S.remove('gym_sets', { session_ms: p.ms });
    return { removed: n };
  });
  on('GET', '/api/workouts', function (S) { return E.templates(S); });
  on('PUT', '/api/workouts/{name}', function (S, p, b) {
    if (!p.name.trim()) throw E.bad('workout name is required');
    return E.saveWorkout(S, p.name, b.exercises || [], b.rename || null);
  });
  on('DELETE', '/api/workouts/{name}', async function (S, p) { await S.remove('gym_workouts', { workout: p.name }); return { ok: true }; });
  on('GET', '/api/exercises', function (S) { return E.exerciseNames(S); });

  // ---------- foods and meals ----------
  var LIGHT_ORDER = { green: 0, yellow: 1, red: 2 };
  on('GET', '/api/foods', function (S, p, b, q) {
    var light = q.get('light');
    return E.foods(S).filter(function (f) { return !light || f.light === light; })
      .sort(function (a, b) { return (light ? 0 : LIGHT_ORDER[a.light] - LIGHT_ORDER[b.light]) || (a.category < b.category ? -1 : a.category > b.category ? 1 : a.name < b.name ? -1 : 1); })
      .map(function (f) { return Object.assign({}, f, { unlocked: f.unlocked ? 1 : 0 }); });
  });
  on('POST', '/api/foods', async function (S, p, b) {
    var name = String(b.name || '').trim();
    if (!name) throw E.bad('name is required');
    var light = b.light || 'green';
    if (['green', 'yellow', 'red'].indexOf(light) < 0) throw E.bad('light must be green, yellow or red');
    if (E.foods(S).some(function (f) { return f.name.toLowerCase() === name.toLowerCase(); })) throw E.bad('A food with that name already exists', 409);
    var id = 'u-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    var data = { name: name, category: b.category || 'other', light: light, carbs_per_serving: Number(b.carbs_per_serving) || 0, serving: b.serving || '',
      store_section: b.store_section || 'Other', note: b.note || '', unlocked: light === 'green' };
    await S.upsert('foods_custom', { food_id: id, data: data });
    return E.foodMap(S)[id];
  });
  on('PATCH', '/api/foods/{id}', async function (S, p, b) {
    var f = E.foodMap(S)[p.id];
    if (!f) throw E.bad('No such food', 404);
    var cur = (S.db.foods_custom.find(function (r) { return r.food_id === p.id; }) || {}).data || {}, data = Object.assign({}, cur), any = false;
    ['unlocked', 'light', 'note', 'store_section', 'carbs_per_serving'].forEach(function (k) { if (b[k] !== undefined && b[k] !== null) { data[k] = k === 'unlocked' ? !!b[k] : b[k]; any = true; } });
    if (!any) throw E.bad('nothing to update');
    await S.upsert('foods_custom', { food_id: p.id, data: data });
    var out = E.foodMap(S)[p.id];
    return Object.assign({}, out, { unlocked: out.unlocked ? 1 : 0 });
  });
  on('GET', '/api/meals', function (S, p, b, q) {
    var type = q.get('meal_type'), foods = E.foodMap(S), macros = E.mealMacros(S);
    return E.meals(S).filter(function (m) { return !type || m.meal_type === type; })
      .sort(function (a, b) { return a.meal_type < b.meal_type ? -1 : a.meal_type > b.meal_type ? 1 : a.name < b.name ? -1 : 1; })
      .map(function (m) {
        var ing = m.ingredients.map(function (i) { var f = foods[i.food_id] || { name: i.food_id, light: 'red', unlocked: false }; return { meal_id: m.id, food_id: i.food_id, name: f.name, light: f.light, unlocked: f.unlocked ? 1 : 0, qty: i.qty, unit: i.unit }; });
        return { id: m.id, name: m.name, meal_type: m.meal_type, portable: m.portable ? 1 : 0, batch: m.batch ? 1 : 0, instructions: m.instructions, enabled: m.enabled ? 1 : 0,
          nutrition: macros[m.id] || null, ingredients: ing, allowed: ing.every(function (i) { return i.unlocked && i.light !== 'red'; }) };
      });
  });
  on('PATCH', '/api/meals/{id}', async function (S, p, b) {
    var m = E.mealMap(S)[p.id];
    if (!m) throw E.bad('No such meal', 404);
    if (b.enabled !== undefined && b.enabled !== null) await S.upsert('meal_prefs', { meal_id: p.id, enabled: !!b.enabled });
    m = E.mealMap(S)[p.id];
    return { id: m.id, name: m.name, meal_type: m.meal_type, enabled: m.enabled ? 1 : 0 };
  });

  // ---------- plans ----------
  on('GET', '/api/plans/week/{d}', function (S, p) { E.parse(p.d); return E.planForWeek(S, p.d); });
  on('POST', '/api/plans', async function (S, p, b) {
    var ws = b.week_start || E.todayStr();
    E.parse(ws);
    var pantry = null;
    if (b.pantry_from) {
      pantry = E.planFoods(S, b.pantry_from);
      if (!pantry.size) throw E.bad('that plan has no meals to take a pantry from', 404);
    }
    var id = await E.generatePlan(S, ws, b.away_days || [], !!b.replace, pantry);
    var out = E.getPlan(S, id);
    if (pantry) {
      var foods = E.foodMap(S);
      out.to_buy = Array.from(E.planFoods(S, id)).filter(function (f) { return !pantry.has(f); }).map(function (f) { return foods[f] ? foods[f].name : f; }).sort();
    }
    return out;
  });
  on('PATCH', '/api/plans/slots/{id}', async function (S, p, b) { return E.getPlan(S, await E.setSlot(S, p.id, b.meal_id || null)); });
  on('PATCH', '/api/plans/days/{id}', async function (S, p, b) { return E.getPlan(S, await E.setDayAway(S, p.id, !!b.away)); });
  on('GET', '/api/plans/{id}/shopping', function (S, p) { return E.shoppingList(S, p.id); });
  on('PATCH', '/api/plans/{id}/shopping/{food}', async function (S, p, b) { await E.setCheck(S, p.id, p.food, !!b.checked); return E.shoppingList(S, p.id); });
  on('GET', '/api/plans/{id}/batch', function (S, p) { return { batch: E.batchCook(S, p.id), cooler: E.coolerBag(S, p.id) }; });

  // ---------- forecast and the training week ----------
  on('GET', '/api/forecast', function (S) { return E.forecast(S); });
  on('GET', '/api/training/week/{d}', function (S, p) {
    E.parse(p.d);
    var a = E.assumptions(S), ws = E.monday(p.d);
    return { week_start: ws, days: E.week(S, a, E.latestWeight(S, a), ws) };
  });
  on('POST', '/api/forecast/fit', async function (S, p, b) {
    var fc = E.forecast(S), fit = fc.fit, mode = b.mode || 'activity';
    if (!fit) throw E.bad('Set a target date first');
    if (mode === 'activity') {
      if (!fit.activity.feasible) throw E.bad('No amount of walking and riding gets there by that date at this intake; try the intake fit');
      await S.upsert('settings', [{ key: 'walk_min_per_week', value: String(fit.activity.walk_min_per_week) }, { key: 'bike_min_per_week', value: String(fit.activity.bike_min_per_week) }]);
    } else if (mode === 'intake') {
      if (fit.intake === null) throw E.bad('Even 800 kcal a day does not get there by that date; move the date');
      await E.set(S, 'daily_kcal', fit.intake);
    } else throw E.bad('mode must be activity or intake', 422);
    return E.forecast(S);
  });

  // ---------- blog ----------
  on('GET', '/api/blog', function (S) {
    var fc = E.forecast(S);
    return E.postDates(S).map(function (ds) { var x = E.post(S, ds, fc); return { date: ds, title: x.title, commentary: !!x.commentary, published_at: x.published_at }; });
  });
  on('POST', '/api/blog/publish', function (S) { return E.exportSite(S); });
  on('GET', '/api/blog/{ds}', function (S, p) { E.parse(p.ds); return E.post(S, p.ds); });
  on('PUT', '/api/blog/{ds}', async function (S, p, b) {
    E.parse(p.ds);
    var c = S.db.blog_posts.find(function (x) { return x.date === p.ds; }) || {};
    var title = String(b.title || '').trim() || c.title || null;
    await S.upsert('blog_posts', { date: p.ds, commentary: String(b.commentary || '').trim(), title: title, published_at: c.published_at || null, updated_at: new Date().toISOString() });
    return E.post(S, p.ds);
  });

  // ---------- dashboard ----------
  on('GET', '/api/summary', function (S) {
    var w = E.weightStats(S), b = E.bpStats(S), today = E.todayStr(), mon = E.monday(today);
    var weekly = E.weeklyVolume(S, 8), sessions = E.sessions(S, 1), plan = E.planForWeek(S, today), a = E.assumptions(S);
    var todayPlan = plan ? plan.days.find(function (d) { return d.date === today; }) || null : null;
    var weights = w.entries.map(function (e) { return { date: e.date, weight: e.weight }; });
    delete w.entries; delete b.entries; delete b.rolling;
    var sched = E.week(S, a, w.current || a.start_weight, mon, today)[E.weekday(today)];
    var lift = sched.items.find(function (x) { return x.what === 'Lift'; });
    return {
      today: today, weight: w, weights: weights, bp: b,
      gym: { last_session: sessions[0] || null, this_week: weekly.find(function (x) { return x.week_start === mon; }) || null, weekly: weekly,
        workout_dates: E.workoutDates(S), prs: E.personalRecords(S).filter(function (p) { return p.new; }) },
      plan_id: plan ? plan.id : null, today_plan: todayPlan, today_schedule: sched,
      today_lift: lift ? { workout: lift.workout, status: lift.status, exercises: E.workoutTemplate(S, lift.workout) } : null,
      day_no: E.daysBetween(a.start_date, today) + 1,
      has_my_code: !!E.get(S, 'my_code')
    };
  });
})(typeof window !== 'undefined' ? window : globalThis);
