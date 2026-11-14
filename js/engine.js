/* Weight Target engine: the arithmetic of the app, over the rows in HT.store.
   Ported from the Python server it replaces (weight and blood pressure statistics, nutrition, the meal
   planner and shopping list, the energy-balance forecast, the training week, the workout log, the daily
   blog). Dates are local YYYY-MM-DD strings; times are epoch milliseconds. */
(function (root) {
  'use strict';
  var HT = root.HT = root.HT || {};
  var E = HT.E = {};

  // ---------- dates ----------
  function pad(n) { return String(n).padStart(2, '0'); }
  E.iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  E.parse = function (s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) throw E.bad('date must be YYYY-MM-DD');
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (E.iso(d) !== s) throw E.bad('date must be YYYY-MM-DD');
    return d;
  };
  E.today = function () { return HT.now ? HT.now() : new Date(); };
  E.todayStr = function () { return E.iso(E.today()); };
  E.addDays = function (s, n) { var d = E.parse(s); d.setDate(d.getDate() + n); return E.iso(d); };
  E.daysBetween = function (a, b) { return Math.round((E.parse(b) - E.parse(a)) / 86400000); };   // b - a
  E.weekday = function (s) { return (E.parse(s).getDay() + 6) % 7; };   // Monday 0
  E.monday = function (s) { return E.addDays(s, -E.weekday(s)); };
  E.msDate = function (ms) { return E.iso(new Date(Number(ms))); };
  E.nowIso = function () { var d = new Date(); return E.iso(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  function r1(x) { return Math.round(x * 10) / 10; }
  function r2(x) { return Math.round(x * 100) / 100; }
  E.r1 = r1;

  E.bad = function (msg, status) { var e = new Error(msg); e.status = status || 400; return e; };

  // ---------- settings ----------
  E.DEFAULTS = {
    setup_done: '0', start_weight: '250', target_weight: '200', start_date: '', sex: 'male', age: '50', height_in: '70',
    activity: 'sedentary', workouts_per_week: '', kcal_per_workout: '300', daily_kcal: '', water_loss_lb: '6', target_date: '',
    lift_rotation: 'Push,Pull,Legs,Push,Pull,Legs,Rest', walk_min_per_week: '0', bike_min_per_week: '0', walk_pace: 'brisk',
    bike_pace: 'moderate', blog_title: 'The Weight Log', blog_intro: '', workout_goal_per_week: '6', gymace_last_sync: '',
    name: '', my_code: ''
  };
  E.SETTING_KEYS = Object.keys(E.DEFAULTS);
  E.get = function (S, key, dflt) {
    var r = S.db.settings.find(function (x) { return x.key === key; });
    if (r) return r.value;
    return dflt !== undefined ? dflt : (E.DEFAULTS[key] !== undefined ? E.DEFAULTS[key] : '');
  };
  E.set = function (S, key, value) { return S.upsert('settings', { key: key, value: String(value) }); };
  E.allSettings = function (S) {
    var out = Object.assign({}, E.DEFAULTS);
    S.db.settings.forEach(function (r) { out[r.key] = r.value; });
    return out;
  };

  // ---------- the library, with this person's changes ----------
  var LIB = function () { return root.HT_LIB || { foods: [], meals: [] }; };
  E.foods = function (S) {
    var custom = {};
    S.db.foods_custom.forEach(function (r) { custom[r.food_id] = r.data || {}; });
    var out = LIB().foods.map(function (f) { return Object.assign({}, f, custom[f.id] || {}, { id: f.id, custom: false }); });
    Object.keys(custom).forEach(function (id) {
      if (id.indexOf('u-') === 0 && custom[id].name) out.push(Object.assign({ unit_grams: {}, kcal_100: null, protein_100: null, fat_100: null, carbs_100: null }, custom[id], { id: id, custom: true }));
    });
    return out;
  };
  E.foodMap = function (S) { var m = {}; E.foods(S).forEach(function (f) { m[f.id] = f; }); return m; };
  E.meals = function (S) {
    var off = {};
    S.db.meal_prefs.forEach(function (r) { off[r.meal_id] = r.enabled; });
    return LIB().meals.map(function (m) { return Object.assign({}, m, { enabled: off[m.id] === undefined ? true : !!off[m.id] }); });
  };
  E.mealMap = function (S) { var m = {}; E.meals(S).forEach(function (x) { m[x.id] = x; }); return m; };

  // ---------- nutrition ----------
  var OZ = 28.35, DEFAULT_UNIT_G = { oz: OZ, tbsp: 15, tsp: 5, cup: 240 }, KEYS = ['kcal', 'protein', 'fat', 'carbs'];
  E.zero = function () { return { kcal: 0, protein: 0, fat: 0, carbs: 0 }; };
  E.grams = function (food, qty, unit) {
    var units = food.unit_grams || {};
    var g = units[unit] !== undefined ? units[unit] : DEFAULT_UNIT_G[unit];
    return g === undefined ? null : qty * g;
  };
  E.macros = function (food, qty, unit) {
    var g = E.grams(food, qty, unit);
    if (g === null || food.kcal_100 == null) return null;
    var f = g / 100;
    return { kcal: food.kcal_100 * f, protein: food.protein_100 * f, fat: food.fat_100 * f, carbs: food.carbs_100 * f };
  };
  E.addM = function (t, p) { if (p) KEYS.forEach(function (k) { t[k] += p[k]; }); return t; };
  E.rounded = function (m) { return { kcal: Math.round(m.kcal), protein: Math.round(m.protein), fat: Math.round(m.fat), carbs: r1(m.carbs) }; };
  E.mealMacros = function (S) {
    var foods = E.foodMap(S), out = {};
    LIB().meals.forEach(function (m) {
      var t = E.zero(), complete = true;
      m.ingredients.forEach(function (i) {
        var f = foods[i.food_id], p = f ? E.macros(f, i.qty, i.unit) : null;
        if (!p) complete = false;
        E.addM(t, p);
      });
      out[m.id] = Object.assign(E.rounded(t), { complete: complete });
    });
    return out;
  };

  // ---------- weight ----------
  function linearFit(pts) {
    var n = pts.length; if (n < 2) return null;
    var mx = pts.reduce(function (a, p) { return a + p[0]; }, 0) / n, my = pts.reduce(function (a, p) { return a + p[1]; }, 0) / n;
    var den = pts.reduce(function (a, p) { return a + (p[0] - mx) * (p[0] - mx); }, 0);
    if (den === 0) return null;
    return pts.reduce(function (a, p) { return a + (p[0] - mx) * (p[1] - my); }, 0) / den;
  }
  E.weightEntries = function (S) {
    return S.db.weight_log.map(function (r) { return { id: r.id, date: r.date, weight: Number(r.weight), note: r.note || '' }; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  };
  E.weightStats = function (S) {
    var entries = E.weightEntries(S);
    var startW = parseFloat(E.get(S, 'start_weight')), target = parseFloat(E.get(S, 'target_weight'));
    var out = { entries: entries, start_weight: startW, target_weight: target, current: null, lost: 0, to_go: null, rate_per_week: null,
      projected_date: null, weeks_left: null, moving_avg: [] };
    if (!entries.length) { out.to_go = r1(startW - target); return out; }
    var cur = entries[entries.length - 1].weight;
    out.current = cur; out.lost = r1(startW - cur); out.to_go = r1(cur - target);
    entries.forEach(function (e, i) {
      var w = entries.slice(0, i + 1).filter(function (x) { return E.daysBetween(x.date, e.date) < 7; }).map(function (x) { return x.weight; });
      out.moving_avg.push({ date: e.date, avg: r1(w.reduce(function (a, b) { return a + b; }, 0) / w.length) });
    });
    var last = entries[entries.length - 1].date;
    var recent = entries.filter(function (e) { return E.daysBetween(e.date, last) <= 28; });
    if (recent.length < 2) recent = entries;
    var pts = recent.map(function (e) { return [-E.daysBetween(e.date, last), e.weight]; });
    var slope = linearFit(pts), span = pts[pts.length - 1][0] - pts[0][0];
    if (slope !== null && span >= 3) {
      out.rate_per_week = r2(slope * 7);
      if (slope < 0 && cur > target) {
        var days = (cur - target) / (-slope);
        out.weeks_left = r1(days / 7);
        out.projected_date = E.addDays(last, Math.round(days));
      }
    }
    return out;
  };

  // ---------- blood pressure ----------
  E.bpCategory = function (sys, dia) {
    if (sys >= 180 || dia >= 120) return 'crisis';
    if (sys >= 140 || dia >= 90) return 'stage2';
    if (sys >= 130 || dia >= 80) return 'stage1';
    if (sys >= 120) return 'elevated';
    return 'normal';
  };
  function tms(s) { return new Date(s.length === 10 ? s + 'T00:00' : s).getTime(); }
  E.bpStats = function (S) {
    var entries = S.db.bp_log.map(function (r) { return Object.assign({}, r); }).sort(function (a, b) { return a.taken_at < b.taken_at ? -1 : 1; });
    var out = { entries: entries, latest: null, avg7: null, avg30: null, category: null, rolling: [] };
    if (!entries.length) return out;
    entries.forEach(function (e) { e.category = E.bpCategory(e.systolic, e.diastolic); });
    function avg(days, anchor) {
      var w = entries.filter(function (e) { var dd = (anchor - tms(e.taken_at)) / 86400000; return dd >= 0 ? Math.floor(dd) < days : true; })
        .filter(function (e) { return tms(e.taken_at) <= anchor; });
      if (!w.length) return null;
      var p = w.filter(function (e) { return e.pulse; });
      return { systolic: Math.round(w.reduce(function (a, e) { return a + e.systolic; }, 0) / w.length),
        diastolic: Math.round(w.reduce(function (a, e) { return a + e.diastolic; }, 0) / w.length),
        pulse: p.length ? Math.round(p.reduce(function (a, e) { return a + e.pulse; }, 0) / p.length) : null, n: w.length };
    }
    var latest = entries[entries.length - 1];
    out.latest = latest;
    var now = tms(latest.taken_at);
    out.avg7 = avg(7, now); out.avg30 = avg(30, now);
    out.category = E.bpCategory(out.avg7.systolic, out.avg7.diastolic);
    entries.forEach(function (e) { var a = avg(7, tms(e.taken_at)); out.rolling.push({ taken_at: e.taken_at, systolic: a.systolic, diastolic: a.diastolic }); });
    return out;
  };

  // ---------- gym: the queries over gym_sets ----------
  function sets(S) { return S.db.gym_sets; }
  E.sessions = function (S, limit) {
    var by = {};
    sets(S).forEach(function (s) {
      var k = String(s.session_ms), b = by[k];
      if (!b) b = by[k] = { session_ms: Number(s.session_ms), date: s.date, workout: '', sets: 0, ex: {}, volume: 0 };
      if ((s.workout || '') > b.workout) b.workout = s.workout || '';
      b.sets++; b.ex[s.exercise] = 1; b.volume += (s.weight || 0) * (s.reps || 0);
    });
    return Object.values(by).sort(function (a, b) { return b.session_ms - a.session_ms; }).slice(0, limit || 60)
      .map(function (b) { return { session_ms: b.session_ms, date: b.date, workout: b.workout, sets: b.sets, exercises: Object.keys(b.ex).length, volume: Math.round(b.volume) }; });
  };
  E.sessionDetail = function (S, ms) {
    var list = sets(S).filter(function (s) { return Number(s.session_ms) === Number(ms); }).sort(function (a, b) { return a.set_ms - b.set_ms; });
    var ex = [];
    list.forEach(function (s) {
      var e = ex.find(function (x) { return x.exercise === s.exercise; });
      if (!e) { e = { exercise: s.exercise, sets: [] }; ex.push(e); }
      e.sets.push({ exercise: s.exercise, weight: s.weight, reps: s.reps, set_ms: Number(s.set_ms), note: s.note || '' });
    });
    return { session_ms: Number(ms), date: E.msDate(ms), workout: list.length ? list[0].workout || '' : '', exercises: ex };
  };
  E.weeklyVolume = function (S, weeks) {
    var b = {};
    sets(S).forEach(function (d) {
      var k = E.monday(d.date), x = b[k] || (b[k] = { week_start: k, volume: 0, sets: 0, sessions: {} });
      x.volume += (d.weight || 0) * (d.reps || 0); x.sets++; x.sessions[d.session_ms] = 1;
    });
    return Object.keys(b).sort().slice(-(weeks || 16)).map(function (k) { var x = b[k]; return { week_start: k, volume: Math.round(x.volume), sets: x.sets, sessions: Object.keys(x.sessions).length }; });
  };
  E.personalRecords = function (S) {
    var data = sets(S).filter(function (s) { return s.weight != null; }).slice()
      .sort(function (a, b) { return a.exercise < b.exercise ? -1 : a.exercise > b.exercise ? 1 : a.set_ms - b.set_ms; });
    var best = {}, beaten = {};
    data.forEach(function (d) {
      var cur = best[d.exercise];
      var rec = { exercise: d.exercise, weight: d.weight, reps: d.reps, date: d.date, new: false };
      if (!cur) { best[d.exercise] = rec; beaten[d.exercise] = false; }
      else if (d.weight > cur.weight || (d.weight === cur.weight && (d.reps || 0) > (cur.reps || 0))) {
        beaten[d.exercise] = d.date !== cur.date || beaten[d.exercise];
        best[d.exercise] = rec;
      }
    });
    var recent = E.addDays(E.todayStr(), -14);
    return Object.keys(best).sort().map(function (k) { var v = best[k]; v.new = v.date >= recent && beaten[k]; return v; });
  };
  E.exerciseHistory = function (S, name) {
    var b = {};
    sets(S).filter(function (s) { return s.exercise === name; }).forEach(function (s) {
      var x = b[s.date] || (b[s.date] = { date: s.date, top_weight: null, sets: 0, volume: 0 });
      if (s.weight != null && (x.top_weight === null || s.weight > x.top_weight)) x.top_weight = s.weight;
      x.sets++; x.volume += (s.weight || 0) * (s.reps || 0);
    });
    return Object.keys(b).sort().map(function (k) { b[k].volume = Math.round(b[k].volume); return b[k]; });
  };
  E.workoutDates = function (S) { return Array.from(new Set(sets(S).map(function (s) { return s.date; }))).sort(); };
  E.workoutNames = function (S) {
    var names = Array.from(new Set(S.db.gym_workouts.map(function (r) { return r.workout; }))).sort();
    if (!names.length) names = Array.from(new Set(sets(S).map(function (s) { return s.workout; }).filter(Boolean))).sort();
    return names;
  };
  function topOfLast(S, exercise) {
    var mine = sets(S).filter(function (s) { return s.exercise === exercise; });
    if (!mine.length) return null;
    var last = Math.max.apply(null, mine.map(function (s) { return Number(s.session_ms); }));
    var ses = mine.filter(function (s) { return Number(s.session_ms) === last; });
    var top = ses.reduce(function (a, s) { return (s.weight || 0) > (a.weight || 0) ? s : a; }, ses[0]);
    return { date: ses[0].date, weight: Math.max.apply(null, ses.map(function (s) { return s.weight || 0; })), reps: top.reps };
  }
  E.workoutTemplate = function (S, name) {
    var ex = S.db.gym_workouts.filter(function (r) { return r.workout === name; }).sort(function (a, b) { return a.ord - b.ord; })
      .map(function (r) { return { exercise: r.exercise, note: r.note || '' }; });
    if (!ex.length) {
      var ofIt = sets(S).filter(function (s) { return s.workout === name; });
      if (!ofIt.length) return [];
      var last = Math.max.apply(null, ofIt.map(function (s) { return Number(s.session_ms); }));
      var seen = [];
      ofIt.filter(function (s) { return Number(s.session_ms) === last; }).sort(function (a, b) { return a.set_ms - b.set_ms; })
        .forEach(function (s) { if (seen.indexOf(s.exercise) < 0) seen.push(s.exercise); });
      ex = seen.map(function (e) { return { exercise: e, note: '' }; });
    }
    return ex.map(function (e) { return { exercise: e.exercise, note: e.note, last: topOfLast(S, e.exercise) }; });
  };

  // ---------- the workout log ----------
  E.DEFAULT_WORKOUTS = {
    Push: [['Bench Press', 3, 10], ['Incline Dumbbell Press', 3, 10], ['Overhead Press', 3, 10], ['Lateral Raise', 3, 12], ['Triceps Pushdown', 3, 12]],
    Pull: [['Lat Pulldown', 3, 10], ['Seated Row', 3, 10], ['Face Pull', 3, 15], ['Dumbbell Curl', 3, 10], ['Hammer Curl', 3, 10]],
    Legs: [['Leg Press', 3, 10], ['Romanian Deadlift', 3, 10], ['Leg Curl', 3, 12], ['Leg Extension', 3, 12], ['Calf Raise', 3, 15]]
  };
  E.seedDefaultWorkouts = async function (S) {
    if (S.db.gym_workouts.length || S.db.gym_sets.length) return 0;
    var rows = [];
    Object.keys(E.DEFAULT_WORKOUTS).forEach(function (w) {
      E.DEFAULT_WORKOUTS[w].forEach(function (x, i) { rows.push({ workout: w, exercise: x[0], ord: i, note: x[1] + ' sets of ' + x[2], target_sets: x[1], target_reps: x[2] }); });
    });
    await S.upsert('gym_workouts', rows);
    return rows.length;
  };
  var NOTE_RE = /(\d+)\s*sets?\s*(?:of|x|×)\s*(\d+)/i;
  function targets(r) {
    var s = r.target_sets == null ? null : r.target_sets, p = r.target_reps == null ? null : r.target_reps;
    if (s === null && p === null && r.note) { var m = NOTE_RE.exec(r.note); if (m) { s = +m[1]; p = +m[2]; } }
    return { exercise: r.exercise, ord: r.ord, note: r.note || '', target_sets: s, target_reps: p };
  }
  E.templates = function (S) {
    var by = {};
    S.db.gym_workouts.slice().sort(function (a, b) { return a.workout < b.workout ? -1 : a.workout > b.workout ? 1 : a.ord - b.ord || (a.exercise < b.exercise ? -1 : 1); })
      .forEach(function (r) { (by[r.workout] = by[r.workout] || []).push(targets(r)); });
    return Object.keys(by).map(function (w) { return { workout: w, exercises: by[w] }; });
  };
  E.exerciseNames = function (S) {
    var n = new Set(S.db.gym_workouts.map(function (r) { return r.exercise; }));
    sets(S).forEach(function (s) { n.add(s.exercise); });
    return Array.from(n).sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; });
  };
  E.lastSets = function (S, exercise, beforeMs) {
    var mine = sets(S).filter(function (s) { return s.exercise === exercise && Number(s.session_ms) < beforeMs; });
    if (!mine.length) return null;
    var ses = Math.max.apply(null, mine.map(function (s) { return Number(s.session_ms); }));
    return { date: E.msDate(ses), sets: mine.filter(function (s) { return Number(s.session_ms) === ses; }).sort(function (a, b) { return a.set_ms - b.set_ms; })
      .map(function (s) { return { weight: s.weight, reps: s.reps }; }) };
  };
  E.sessionsOn = function (S, ds) {
    var out = {}, order = [];
    sets(S).filter(function (s) { return s.date === ds; }).sort(function (a, b) { return a.session_ms - b.session_ms || a.set_ms - b.set_ms; }).forEach(function (s) {
      var k = String(s.session_ms), ses = out[k];
      if (!ses) { ses = out[k] = { session_ms: Number(s.session_ms), workout: s.workout || '', exercises: [], sets: 0, volume: 0 }; order.push(k); }
      var ex = ses.exercises.find(function (e) { return e.exercise === s.exercise; });
      if (!ex) { ex = { exercise: s.exercise, sets: [] }; ses.exercises.push(ex); }
      ex.sets.push({ id: s.id, weight: s.weight, reps: s.reps, note: s.note || '', set_ms: Number(s.set_ms) });
      ses.sets++; ses.volume += (s.weight || 0) * (s.reps || 0);
    });
    return order.map(function (k) { return out[k]; });
  };
  E.logDay = function (S, ds) {
    var start = E.parse(ds).getTime(), tpl = E.templates(S);
    tpl.forEach(function (w) { w.exercises.forEach(function (e) { e.last = E.lastSets(S, e.exercise, start); }); });
    var sessions = E.sessionsOn(S, ds);
    sessions.forEach(function (ses) { ses.exercises.forEach(function (e) { e.last = E.lastSets(S, e.exercise, start); }); });
    return { date: ds, sessions: sessions, workouts: tpl, exercises: E.exerciseNames(S) };
  };
  E.getSet = function (S, id) {
    var r = sets(S).find(function (s) { return String(s.id) === String(id); });
    return r ? { id: r.id, session_ms: Number(r.session_ms), workout: r.workout, exercise: r.exercise, weight: r.weight, reps: r.reps, note: r.note || '', set_ms: Number(r.set_ms), date: r.date } : null;
  };
  E.addSet = async function (S, b) {
    var mine = sets(S).filter(function (s) { return Number(s.session_ms) === Number(b.session_ms); });
    var last = mine.reduce(function (a, s) { return Math.max(a, Number(s.set_ms)); }, 0);
    var row = await S.insert('gym_sets', { gymace_id: null, session_ms: Number(b.session_ms), set_ms: Math.max(Date.now(), last + 1), date: E.msDate(b.session_ms),
      workout: String(b.workout || '').trim(), exercise: String(b.exercise).trim(), weight: b.weight == null ? null : Number(b.weight), reps: b.reps == null ? null : Math.round(b.reps), note: b.note || '' });
    return E.getSet(S, row.id);
  };
  E.saveWorkout = async function (S, name, exercises, rename) {
    name = String(name).trim();
    var nu = String(rename || name).trim() || name;
    await S.remove('gym_workouts', { workout: name });
    if (nu !== name) {
      await S.remove('gym_workouts', { workout: nu });
      if (sets(S).some(function (s) { return s.workout === name; })) await S.update('gym_sets', { workout: name }, { workout: nu });
      var rot = E.get(S, 'lift_rotation').split(',').map(function (x) { return x.trim() === name ? nu : x.trim(); });
      await E.set(S, 'lift_rotation', rot.join(','));
    }
    var seen = {}, rows = [], ord = 0;
    exercises.forEach(function (e) {
      var ex = String(e.exercise || '').trim();
      if (!ex || seen[ex.toLowerCase()]) return;
      seen[ex.toLowerCase()] = 1;
      var s = e.target_sets == null ? null : e.target_sets, r = e.target_reps == null ? null : e.target_reps;
      rows.push({ workout: nu, exercise: ex, ord: ord++, note: e.note || (s && r ? s + ' sets of ' + r : ''), target_sets: s, target_reps: r });
    });
    await S.upsert('gym_workouts', rows);
    return E.templates(S).find(function (w) { return w.workout === nu; }) || { workout: nu, exercises: [] };
  };

  // ---------- meal planner ----------
  E.SLOTS = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];
  var SECTION_ORDER = ['Meat', 'Seafood', 'Deli', 'Dairy & Eggs', 'Produce', 'Pantry', 'Snacks', 'Drinks', 'Frozen', 'Other'];
  function rng(seed) {   // mulberry32 seeded by the week, so a week's plan comes out the same each time it is made
    var h = 1779033703 ^ seed.length;
    for (var i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    var a = h >>> 0;
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  E.allowedMeals = function (S) {
    var foods = E.foodMap(S);
    return E.meals(S).filter(function (m) {
      return m.enabled && m.ingredients.every(function (i) { var f = foods[i.food_id]; return f && f.unlocked && f.light !== 'red'; });
    });
  };
  E.plan = function (S, id) { return S.db.plans.find(function (p) { return String(p.id) === String(id); }) || null; };
  E.planFoods = function (S, id) {
    var p = E.plan(S, id), mm = E.mealMap(S), out = new Set();
    if (!p) return out;
    p.days.forEach(function (d) { d.slots.forEach(function (s) { var m = mm[s.meal_id]; if (m) m.ingredients.forEach(function (i) { out.add(i.food_id); }); }); });
    return out;
  };
  function pick(rand, pool, used, portableOnly, avoid) {
    var c = pool.filter(function (m) { return (m.portable || !portableOnly) && !(avoid && avoid[m.id]); });
    if (!c.length) c = pool.filter(function (m) { return m.portable || !portableOnly; });
    if (!c.length) return null;
    var low = Math.min.apply(null, c.map(function (m) { return used[m.id] || 0; }));
    c = c.filter(function (m) { return (used[m.id] || 0) === low; });
    var ch = c[Math.floor(rand() * c.length)];
    used[ch.id] = (used[ch.id] || 0) + 1;
    return ch;
  }
  E.generatePlan = async function (S, weekStart, awayDays, replace, pantry) {
    var ws = E.monday(weekStart), away = {};
    (awayDays || []).forEach(function (d) { away[d] = 1; });
    var existing = S.db.plans.find(function (p) { return p.week_start === ws; });
    if (existing) {
      if (!replace) return existing.id;
      await S.remove('plans', { id: existing.id });
    }
    var byType = { breakfast: [], lunch: [], dinner: [], snack: [] };
    E.allowedMeals(S).forEach(function (m) { (byType[m.meal_type] = byType[m.meal_type] || []).push(m); });
    if (pantry) {
      Object.keys(byType).forEach(function (t) {
        var inP = byType[t].filter(function (m) { return m.ingredients.every(function (i) { return pantry.has(i.food_id); }); });
        if (inP.length) byType[t] = inP;
      });
    }
    var rand = rng(ws), used = {}, days = [], prevDinner = null;
    for (var i = 0; i < 7; i++) {
      var d = E.addDays(ws, i), isAway = !!away[d], ch = {};
      ch.breakfast = pick(rand, byType.breakfast, used, isAway);
      ch.lunch = pick(rand, byType.lunch, used, isAway);
      var av = {}; if (prevDinner) av[prevDinner] = 1;
      ch.dinner = pick(rand, byType.dinner, used, false, av);
      prevDinner = ch.dinner ? ch.dinner.id : null;
      ch.snack1 = pick(rand, byType.snack, used, isAway);
      var av2 = {}; if (ch.snack1) av2[ch.snack1.id] = 1;
      ch.snack2 = pick(rand, byType.snack, used, isAway, av2);
      days.push({ date: d, away: isAway, slots: E.SLOTS.map(function (s) { return { slot: s, meal_id: ch[s] ? ch[s].id : null }; }) });
    }
    var row = await S.insert('plans', { week_start: ws, created_at: new Date().toISOString(), days: days, checks: {} });
    return row.id;
  };
  // Days and slots have numeric ids made from the plan's: day = plan*10 + day, slot = plan*100 + day*10 + slot.
  E.getPlan = function (S, id) {
    var p = E.plan(S, id);
    if (!p) return null;
    var mm = E.mealMap(S), macros = E.mealMacros(S);
    var days = p.days.map(function (d, di) {
      var total = E.zero(), complete = true;
      var slots = E.SLOTS.map(function (slot, si) {
        var s = d.slots.find(function (x) { return x.slot === slot; }) || { slot: slot, meal_id: null };
        var m = s.meal_id ? mm[s.meal_id] : null, n = m ? macros[m.id] : null;
        if (n) { E.addM(total, n); complete = complete && n.complete; }
        return { id: p.id * 100 + di * 10 + si, slot: slot, meal_id: m ? m.id : null, name: m ? m.name : null, portable: m ? m.portable : null,
          batch: m ? m.batch : null, instructions: m ? m.instructions : null, nutrition: n || null };
      });
      return { id: p.id * 10 + di, plan_id: p.id, date: d.date, away: d.away ? 1 : 0, slots: slots, nutrition: Object.assign(E.rounded(total), { complete: complete }) };
    });
    return { id: p.id, week_start: p.week_start, created_at: p.created_at, days: days };
  };
  E.planForWeek = function (S, anyDate) {
    var ws = E.monday(anyDate), p = S.db.plans.find(function (x) { return x.week_start === ws; });
    return p ? E.getPlan(S, p.id) : null;
  };
  function planOfDay(S, dayId) { var pid = Math.floor(Number(dayId) / 10); return { p: E.plan(S, pid), di: Number(dayId) % 10 }; }
  E.setSlot = async function (S, slotId, mealId) {
    var pid = Math.floor(Number(slotId) / 100), rest = Number(slotId) % 100, di = Math.floor(rest / 10), si = rest % 10, p = E.plan(S, pid);
    if (!p || !p.days[di]) throw E.bad('No such slot', 404);
    var days = JSON.parse(JSON.stringify(p.days)), slot = E.SLOTS[si];
    var s = days[di].slots.find(function (x) { return x.slot === slot; });
    if (s) s.meal_id = mealId || null; else days[di].slots.push({ slot: slot, meal_id: mealId || null });
    await S.update('plans', { id: p.id }, { days: days });
    return p.id;
  };
  E.setDayAway = async function (S, dayId, away) {
    var x = planOfDay(S, dayId);
    if (!x.p || !x.p.days[x.di]) throw E.bad('No such day', 404);
    var days = JSON.parse(JSON.stringify(x.p.days));
    days[x.di].away = !!away;
    await S.update('plans', { id: x.p.id }, { days: days });
    return x.p.id;
  };
  E.shoppingList = function (S, id) {
    var p = E.plan(S, id);
    if (!p) return [];
    var mm = E.mealMap(S), foods = E.foodMap(S), items = {}, checks = p.checks || {};
    p.days.forEach(function (d) {
      d.slots.forEach(function (s) {
        var m = mm[s.meal_id]; if (!m) return;
        m.ingredients.forEach(function (i) {
          var f = foods[i.food_id]; if (!f) return;
          var k = f.id + '|' + i.unit;
          var it = items[k] || (items[k] = { food_id: f.id, name: f.name, store_section: f.store_section, unit: i.unit, qty: 0, checked: checks[f.id] ? 1 : 0 });
          it.qty += i.qty;
        });
      });
    });
    var groups = {};
    Object.values(items).sort(function (a, b) { return a.name < b.name ? -1 : 1; }).forEach(function (it) { it.qty = r2(it.qty); (groups[it.store_section] = groups[it.store_section] || []).push(it); });
    return Object.keys(groups).sort(function (a, b) {
      var ia = SECTION_ORDER.indexOf(a), ib = SECTION_ORDER.indexOf(b);
      ia = ia < 0 ? 99 : ia; ib = ib < 0 ? 99 : ib;
      return ia - ib || (a < b ? -1 : 1);
    }).map(function (s) { return { section: s, items: groups[s] }; });
  };
  E.setCheck = async function (S, id, foodId, checked) {
    var p = E.plan(S, id);
    if (!p) throw E.bad('No such plan', 404);
    var c = Object.assign({}, p.checks || {});
    if (checked) c[foodId] = true; else delete c[foodId];
    await S.update('plans', { id: p.id }, { checks: c });
  };
  E.batchCook = function (S, id) {
    var p = E.plan(S, id), mm = E.mealMap(S), count = {};
    if (!p) return [];
    p.days.forEach(function (d) { d.slots.forEach(function (s) { var m = mm[s.meal_id]; if (m && m.batch) count[m.id] = (count[m.id] || 0) + 1; }); });
    return Object.keys(count).map(function (k) { var m = mm[k]; return { id: m.id, name: m.name, meal_type: m.meal_type, instructions: m.instructions, servings: count[k] }; })
      .sort(function (a, b) { return a.meal_type < b.meal_type ? -1 : a.meal_type > b.meal_type ? 1 : a.name < b.name ? -1 : 1; });
  };
  E.coolerBag = function (S, id) {
    var p = E.plan(S, id), mm = E.mealMap(S);
    if (!p) return [];
    return p.days.filter(function (d) { return d.away; }).map(function (d) {
      return { date: d.date, pack: ['breakfast', 'lunch', 'snack1', 'snack2'].map(function (sl) { var s = d.slots.find(function (x) { return x.slot === sl; }); return s && mm[s.meal_id] ? mm[s.meal_id].name : null; }).filter(Boolean) };
    }).filter(function (d) { return d.pack.length; });
  };

  // ---------- forecast ----------
  var ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  var WALK_MET = { easy: 3.0, brisk: 4.3 }, BIKE_MET = { easy: 4.0, moderate: 6.8, hard: 8.0 };
  var DEFAULT_SPLIT = [0.6, 0.4], KCAL_PER_LB = 3500, WATER_DAYS = 10, MAX_DAYS = 1825;
  E.REST = 'Rest';
  E.DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  E.bmr = function (sex, lb, hin, age) { var b = 10 * lb * 0.4536 + 6.25 * hin * 2.54 - 5 * age; return b + (sex === 'male' ? 5 : -161); };
  E.plannedIntake = function (S) {
    var macros = E.mealMacros(S), tot = 0, n = 0;
    S.db.plans.forEach(function (p) {
      p.days.forEach(function (d) {
        var k = 0, any = false;
        d.slots.forEach(function (s) { var m = s.meal_id && macros[s.meal_id]; if (m) { k += m.kcal; any = true; } });
        if (any) { tot += k; n++; }
      });
    });
    return n ? Math.round(tot / n) : null;
  };
  E.gymPerWeek = function (S) {
    var dates = E.workoutDates(S);
    if (!dates.length) return null;
    var today = E.todayStr();
    var recent = dates.filter(function (d) { return E.daysBetween(d, today) < 28; });
    if (recent.length) return r1(recent.length / 4);
    var span = Math.max(E.daysBetween(dates[0], dates[dates.length - 1]), 7);
    return r1(dates.length / (span / 7));
  };
  E.kcalPerMin = function (met, lb) { return (met - 1) * 3.5 * (lb * 0.4536) / 200; };
  function f(S, key, d) { var v = E.get(S, key, ''); if (v === '' || v == null) return d; var x = parseFloat(v); return isNaN(x) ? d : x; }
  E.rotation = function (S) {
    var raw = String(E.get(S, 'lift_rotation') || '').split(',').map(function (x) { return x.trim(); });
    raw = raw.concat([E.REST, E.REST, E.REST, E.REST, E.REST, E.REST, E.REST]).slice(0, 7);
    return raw.map(function (x) { return x || E.REST; });
  };
  E.assumptions = function (S) {
    var a = {
      sex: E.get(S, 'sex') || 'male', age: f(S, 'age', 50), height_in: f(S, 'height_in', 70), activity: E.get(S, 'activity') || 'sedentary',
      kcal_per_workout: f(S, 'kcal_per_workout', 300), water_loss_lb: f(S, 'water_loss_lb', 6), plan_kcal: E.plannedIntake(S),
      gym_workouts_per_week: E.gymPerWeek(S), daily_kcal_override: f(S, 'daily_kcal', null), workouts_override: f(S, 'workouts_per_week', null),
      start_weight: f(S, 'start_weight', 250), start_date: E.get(S, 'start_date') || E.todayStr(), target_weight: f(S, 'target_weight', 200),
      target_date: E.get(S, 'target_date') || null, walk_min_per_week: f(S, 'walk_min_per_week', 0), bike_min_per_week: f(S, 'bike_min_per_week', 0),
      walk_pace: E.get(S, 'walk_pace') || 'brisk', bike_pace: E.get(S, 'bike_pace') || 'moderate'
    };
    a.lift_rotation = E.rotation(S);
    a.walk_met = WALK_MET[a.walk_pace] || 4.3;
    a.bike_met = BIKE_MET[a.bike_pace] || 6.8;
    a.intake = a.daily_kcal_override !== null ? a.daily_kcal_override : (a.plan_kcal !== null ? a.plan_kcal : 2000);
    a.goal_workouts_per_week = a.lift_rotation.filter(function (x) { return x !== E.REST; }).length || f(S, 'workout_goal_per_week', 6);
    a.workouts_per_week = a.workouts_override !== null ? a.workouts_override : a.goal_workouts_per_week;
    a.factor = ACTIVITY[a.activity] || 1.2;
    return a;
  };
  E.levelsOffAt = function (a) {
    var cm = a.height_in * 2.54, c = 6.25 * cm - 5 * a.age + (a.sex === 'male' ? 5 : -161);
    var perKg = (a.walk_min_per_week * (a.walk_met - 1) + a.bike_min_per_week * (a.bike_met - 1)) / 7 * 3.5 / 200;
    var lifting = a.workouts_per_week * a.kcal_per_workout / 7;
    var kg = (a.intake - lifting - a.factor * c) / (10 * a.factor + perKg);
    return r1(kg / 0.4536);
  };
  E.cardioPerDay = function (a, w) { return (a.walk_min_per_week * E.kcalPerMin(a.walk_met, w) + a.bike_min_per_week * E.kcalPerMin(a.bike_met, w)) / 7; };
  E.tdee = function (a, w) { return E.bmr(a.sex, w, a.height_in, a.age) * a.factor + a.workouts_per_week * a.kcal_per_workout / 7 + E.cardioPerDay(a, w); };
  E.simulate = function (a, start, weight, water) {
    var series = [{ date: start, weight: r1(weight) }], hit = null, w = weight, d = E.parse(start);
    for (var i = 1; i <= MAX_DAYS; i++) {
      w -= (E.tdee(a, w) - a.intake) / KCAL_PER_LB;
      if (i <= WATER_DAYS) w -= water / WATER_DAYS;
      d.setDate(d.getDate() + 1);
      var ds = E.iso(d);
      series.push({ date: ds, weight: r1(w) });
      if (w <= a.target_weight) { hit = ds; break; }
      if (w > weight + 50) break;
    }
    return [series, hit];
  };
  function hitsBy(a, start, w, water, td) { var h = E.simulate(a, start, w, water)[1]; return !!(h && h <= td); }
  E.fitToDate = function (a, start, weight, water, td) {
    var out = { feasible_now: hitsBy(a, start, weight, water, td) };
    var tot = a.walk_min_per_week + a.bike_min_per_week;
    var split = tot ? [a.walk_min_per_week / tot, a.bike_min_per_week / tot] : DEFAULT_SPLIT;
    function withMin(m) { return Object.assign({}, a, { walk_min_per_week: Math.round(m * split[0]), bike_min_per_week: Math.round(m * split[1]) }); }
    var lo = 0, hi = 2520, i, mid;
    if (hitsBy(withMin(hi), start, weight, water, td)) {
      for (i = 0; i < 14; i++) { mid = (lo + hi) / 2; if (hitsBy(withMin(mid), start, weight, water, td)) hi = mid; else lo = mid; }
      var b = withMin(hi);
      out.activity = { walk_min_per_week: b.walk_min_per_week, bike_min_per_week: b.bike_min_per_week, feasible: true };
    } else out.activity = { walk_min_per_week: null, bike_min_per_week: null, feasible: false };
    lo = 800; hi = a.intake;
    if (hitsBy(Object.assign({}, a, { intake: lo }), start, weight, water, td)) {
      for (i = 0; i < 14; i++) { mid = (lo + hi) / 2; if (hitsBy(Object.assign({}, a, { intake: mid }), start, weight, water, td)) lo = mid; else hi = mid; }
      out.intake = Math.round(lo / 10) * 10;
    } else out.intake = null;
    return out;
  };
  E.schedule = function (a, weight) {
    var rot = a.lift_rotation || [E.REST, E.REST, E.REST, E.REST, E.REST, E.REST, E.REST];
    var walk = a.walk_min_per_week, walkDays = walk >= 140 ? 7 : walk ? Math.max(1, Math.floor(walk / 20)) : 0;
    var walkIdx = walkDays === 7 ? [0, 1, 2, 3, 4, 5, 6] : [0, 2, 4, 6, 1, 3, 5].slice(0, walkDays);
    var bike = a.bike_min_per_week, bikeDays = !bike ? 0 : bike < 60 ? 1 : bike < 120 ? 2 : bike < 240 ? 3 : 4;
    var bikeIdx = [1, 3, 5, 6].slice(0, bikeDays);
    return E.DAYS.map(function (name, i) {
      var items = [], kcal = 0;
      if (rot[i] !== E.REST) { items.push({ what: 'Lift', workout: rot[i], minutes: null, kcal: Math.round(a.kcal_per_workout) }); kcal += a.kcal_per_workout; }
      if (walkIdx.indexOf(i) >= 0) { var m = Math.round(walk / walkIdx.length), k = m * E.kcalPerMin(a.walk_met, weight); items.push({ what: 'Walk, ' + a.walk_pace, minutes: m, kcal: Math.round(k) }); kcal += k; }
      if (bikeIdx.indexOf(i) >= 0) { var m2 = Math.round(bike / bikeIdx.length), k2 = m2 * E.kcalPerMin(a.bike_met, weight); items.push({ what: 'Ride, ' + a.bike_pace, minutes: m2, kcal: Math.round(k2) }); kcal += k2; }
      return { day: name, items: items, kcal: Math.round(kcal) };
    });
  };
  E.adaptWeek = function (a, sched, done, todayIdx) {
    var rot = a.lift_rotation || [E.REST, E.REST, E.REST, E.REST, E.REST, E.REST, E.REST], kw = Math.round(a.kcal_per_workout);
    var owed = rot.filter(function (x) { return x !== E.REST; });
    Object.keys(done).forEach(function (k) { done[k].forEach(function (n) { var i = owed.indexOf(n); if (i >= 0) owed.splice(i, 1); }); });
    var left = [0, 1, 2, 3, 4, 5, 6].filter(function (i) { return i >= todayIdx && !done[i]; });
    var assign = {};
    left.filter(function (i) { return rot[i] !== E.REST; }).concat(left.filter(function (i) { return rot[i] === E.REST; })).forEach(function (i) { if (owed.length) assign[i] = owed.shift(); });
    return sched.map(function (d, i) {
      var rest = d.items.filter(function (x) { return x.what !== 'Lift'; }), lift = null;
      if (done[i]) lift = { what: 'Lift', workout: done[i][0], also: done[i].slice(1), minutes: null, kcal: kw, status: 'done' };
      else if (assign[i] !== undefined) lift = { what: 'Lift', workout: assign[i], also: [], minutes: null, kcal: kw, status: 'planned' };
      else if (i < todayIdx && rot[i] !== E.REST) lift = { what: 'Lift', workout: rot[i], also: [], minutes: null, kcal: 0, status: 'missed' };
      var items = (lift ? [lift] : []).concat(rest);
      return { day: d.day, items: items, kcal: Math.round(items.reduce(function (s, x) { return s + x.kcal; }, 0)) };
    });
  };
  E.week = function (S, a, weight, weekStart, today) {
    today = today || E.todayStr();
    var end = E.addDays(weekStart, 6), done = {}, seen = {};
    sets(S).filter(function (s) { return s.date >= weekStart && s.date <= end; }).sort(function (x, y) { return x.session_ms - y.session_ms; }).forEach(function (s) {
      if (seen[s.session_ms]) return;
      seen[s.session_ms] = 1;
      var idx = E.daysBetween(weekStart, s.date), name = s.workout || 'Workout';
      done[idx] = done[idx] || [];
      if (done[idx].indexOf(name) < 0) done[idx].push(name);
    });
    return E.adaptWeek(a, E.schedule(a, weight), done, E.daysBetween(weekStart, today));
  };
  E.latestWeight = function (S, a) { var w = E.weightEntries(S); return w.length ? w[w.length - 1].weight : a.start_weight; };
  E.forecast = function (S) {
    var a = E.assumptions(S), start = a.start_date, actual = E.weightEntries(S).map(function (e) { return { date: e.date, weight: e.weight }; });
    var sim = E.simulate(a, start, a.start_weight, a.water_loss_lb), series = sim[0], t0 = E.tdee(a, a.start_weight);
    var out = { assumptions: a, tdee_start: Math.round(t0), deficit_per_day: Math.round(t0 - a.intake), lbs_per_week_start: r2((t0 - a.intake) * 7 / KCAL_PER_LB),
      forecast: series, target_date: sim[1], levels_off_at: E.levelsOffAt(a), actual: actual, from_latest: null, target_date_from_latest: null };
    if (actual.length) {
      var last = actual[actual.length - 1], daysIn = E.daysBetween(start, last.date);
      var waterLeft = daysIn < WATER_DAYS ? Math.max(0, a.water_loss_lb * (1 - daysIn / WATER_DAYS)) : 0;
      var s2 = E.simulate(a, last.date, last.weight, waterLeft);
      out.from_latest = s2[0]; out.target_date_from_latest = s2[1];
      var exp = series.find(function (p) { return p.date === last.date; });
      out.expected_at_latest = exp ? exp.weight : null;
      out.ahead_lb = exp ? r1(exp.weight - last.weight) : null;
    }
    out.cardio_per_day_start = Math.round(E.cardioPerDay(a, a.start_weight));
    if (a.target_date) {
      var td = a.target_date, anchorD = actual.length ? actual[actual.length - 1].date : start, anchorW = actual.length ? actual[actual.length - 1].weight : a.start_weight;
      var daysLeft = Math.max(E.daysBetween(anchorD, td), 1), water = actual.length ? 0 : a.water_loss_lb;
      out.goal_line = [{ date: start, weight: a.start_weight }, { date: td, weight: a.target_weight }];
      out.needed_lb_per_week = r2((anchorW - a.target_weight) / daysLeft * 7);
      var hitDate = out.target_date_from_latest || out.target_date;
      out.on_track = !!(hitDate && hitDate <= td);
      out.fit = E.fitToDate(a, anchorD, anchorW, water, td);
    }
    var today = E.todayStr();
    out.week_start = E.monday(today);
    out.schedule = E.week(S, a, actual.length ? actual[actual.length - 1].weight : a.start_weight, E.monday(today), today);
    return out;
  };

  // ---------- blog ----------
  var SLOT_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack1: 'Snack', snack2: 'Snack' };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  E.longDate = function (s) { var d = E.parse(s); return WEEKDAYS[E.weekday(s)] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
  function g(x) { return String(Math.round(x * 100) / 100); }   // Python's :g for these numbers
  function lb(x) { return g(x) + ' lb'; }
  E.goalPerWeek = function (S) { var n = parseInt(E.get(S, 'workout_goal_per_week'), 10); return isNaN(n) ? 6 : n; };
  E.facts = function (S, ds, fc) {
    var startDate = E.get(S, 'start_date') || ds, startW = parseFloat(E.get(S, 'start_weight')), target = parseFloat(E.get(S, 'target_weight'));
    var out = { date: ds, day_no: E.daysBetween(startDate, ds) + 1, start_weight: startW, target: target };
    var w = E.weightEntries(S).filter(function (x) { return x.date <= ds; });
    var todayW = w.find(function (x) { return x.date === ds; });
    out.weight = todayW ? todayW.weight : null;
    if (todayW && w.length >= 2) { out.prev_weight = w[w.length - 2].weight; out.prev_date = w[w.length - 2].date; }
    else if (w.length && !todayW) { out.prev_weight = w[w.length - 1].weight; out.prev_date = w[w.length - 1].date; }
    else { out.prev_weight = null; out.prev_date = null; }
    var wk = w.filter(function (x) { return E.daysBetween(x.date, ds) < 7; }).map(function (x) { return x.weight; });
    out.avg7 = wk.length ? r1(wk.reduce(function (a, b) { return a + b; }, 0) / wk.length) : null;
    out.lost = todayW ? r1(startW - todayW.weight) : null;
    out.to_go = todayW ? r1(todayW.weight - target) : null;

    var sess = E.sessions(S, 500).filter(function (s) { return s.date === ds; }).sort(function (a, b) { return a.session_ms - b.session_ms; });
    var prsToday = E.personalRecords(S).filter(function (p) { return p.date === ds && p.new; });
    var merged = {}, order = [];
    sess.forEach(function (s) {
      var det = E.sessionDetail(S, s.session_ms), name = s.workout || 'Workout';
      var m = merged[name];
      if (!m) { m = merged[name] = { workout: name, sets: 0, volume: 0, exercises: [] }; order.push(name); }
      m.sets += s.sets; m.volume += s.volume;
      det.exercises.forEach(function (ex) {
        var top = ex.sets.reduce(function (a, x) { var aw = a.weight || 0, xw = x.weight || 0; return xw > aw || (xw === aw && (x.reps || 0) > (a.reps || 0)) ? x : a; }, ex.sets[0]);
        var cur = m.exercises.find(function (e) { return e.exercise === ex.exercise; });
        if (!cur) m.exercises.push({ exercise: ex.exercise, sets: ex.sets.length, top_weight: top.weight || 0, top_reps: top.reps || 0 });
        else {
          cur.sets += ex.sets.length;
          if ((top.weight || 0) > cur.top_weight || ((top.weight || 0) === cur.top_weight && (top.reps || 0) > cur.top_reps)) { cur.top_weight = top.weight || 0; cur.top_reps = top.reps || 0; }
        }
      });
    });
    out.sessions = order.map(function (k) { return merged[k]; });
    out.prs = prsToday;
    var mon = E.monday(ds), dates = new Set(E.workoutDates(S)), i;
    out.week_workouts = 0; out.last7_workouts = 0;
    for (i = 0; i < 7; i++) { var dd = E.addDays(mon, i); if (dates.has(dd) && dd <= ds) out.week_workouts++; }
    for (i = 0; i < 7; i++) if (dates.has(E.addDays(ds, -i))) out.last7_workouts++;
    out.week_goal = E.goalPerWeek(S);

    var plan = E.planForWeek(S, ds), day = plan ? plan.days.find(function (x) { return x.date === ds; }) : null;
    out.meals = day ? day.slots.filter(function (s) { return s.name; }).map(function (s) { return { slot: SLOT_LABEL[s.slot], name: s.name, nutrition: s.nutrition }; }) : [];
    out.day_nutrition = day ? day.nutrition : null;
    out.away = day ? !!day.away : false;

    fc = fc || E.forecast(S);
    var exp = fc.forecast.find(function (p) { return p.date === ds; });
    out.expected = exp ? exp.weight : null;
    out.ahead_lb = exp && todayW ? r1(exp.weight - todayW.weight) : null;
    out.target_date = fc.target_date_from_latest || fc.target_date;
    return out;
  };
  E.generatePost = function (S, ds, fc) {
    var x = E.facts(S, ds, fc), bits = [];
    if (x.weight !== null) bits.push(lb(x.weight));
    bits.push(x.sessions.length ? x.sessions.map(function (s) { return s.workout; }).join(', ') : 'rest day');
    var title = 'Day ' + x.day_no + ': ' + bits.join(', '), p = [];
    if (x.weight !== null) {
      var line = '**Scale:** ' + lb(x.weight) + '.';
      if (x.prev_weight !== null) {
        var ch = r1(x.weight - x.prev_weight);
        line += ch ? ' ' + (ch < 0 ? 'Down' : 'Up') + ' ' + g(Math.abs(ch)) + ' from ' + E.longDate(x.prev_date) + '.' : ' Same as ' + E.longDate(x.prev_date) + '.';
      }
      line += x.day_no === 1 ? ' Day one. ' + g(x.to_go) + ' to go to ' + g(x.target) + '.' : ' Down ' + g(x.lost) + ' since day one, ' + g(x.to_go) + ' to go to ' + g(x.target) + '.';
      if (x.avg7 !== null) line += ' Seven-day average ' + g(x.avg7) + '.';
      p.push(line);
    } else p.push('**Scale:** no weigh-in today.');
    if (x.sessions.length) {
      x.sessions.forEach(function (s) {
        var ex = s.exercises.map(function (e) { return e.exercise + ' ' + e.sets + '×, top set ' + (e.top_weight ? g(e.top_weight) + ' × ' + e.top_reps : e.top_reps + ' reps'); }).join('; ');
        p.push('**Training:** ' + s.workout + '. ' + s.sets + ' sets, ' + Math.round(s.volume).toLocaleString('en-US') + ' lb moved. ' + ex + '.');
      });
      if (x.prs.length) p.push('**New bests:** ' + x.prs.map(function (r) { return r.exercise + ' ' + g(r.weight) + ' × ' + r.reps; }).join('; ') + '.');
    } else p.push('**Training:** rest day.');
    p.push('**This week:** workout ' + x.week_workouts + ' of ' + x.week_goal + '. ' + x.last7_workouts + ' in the last seven days.');
    if (x.meals.length) {
      var n = x.day_nutrition;
      p.push('**Food' + (x.away ? ' (away day, cooler bag)' : '') + ':** ' + x.meals.map(function (m) { return m.slot + ': ' + m.name; }).join('; ') + '.' +
        (n ? ' About ' + n.kcal.toLocaleString('en-US') + ' kcal, ' + n.protein + ' g protein, ' + g(n.carbs) + ' g net carbs.' : '') + ' No bread, no sugar, nothing out of a drive-through.');
    } else p.push('**Food:** no plan logged for today.');
    if (x.ahead_lb !== null) {
      if (x.ahead_lb > 0) p.push('**The line:** ' + g(x.ahead_lb) + ' lb ahead of the forecast.');
      else if (x.ahead_lb < 0) p.push('**The line:** ' + g(Math.abs(x.ahead_lb)) + ' lb behind the forecast. The scale is the truth; the line is the expectation.');
      else p.push('**The line:** right on the forecast.');
    }
    if (x.target_date) p.push('**' + g(x.target) + ' on the calendar:** ' + E.longDate(x.target_date) + ', at this pace.');
    return { date: x.date, title: title, body_md: p.join('\n\n'), facts: x };
  };
  E.post = function (S, ds, fc) {
    var gpost = E.generatePost(S, ds, fc), c = S.db.blog_posts.find(function (b) { return b.date === ds; }) || {};
    gpost.commentary = c.commentary || '';
    gpost.custom_title = c.title || null;
    if (c.title) gpost.title = c.title;
    gpost.published_at = c.published_at || null;
    gpost.markdown = '# ' + gpost.title + '\n\n*' + E.longDate(ds) + '*\n\n' + gpost.body_md + (gpost.commentary ? '\n\n## In my own words\n\n' + gpost.commentary : '');
    return gpost;
  };
  E.postDates = function (S) {
    var ds = new Set(E.weightEntries(S).map(function (x) { return x.date; }));
    E.workoutDates(S).forEach(function (d) { ds.add(d); });
    S.db.blog_posts.forEach(function (b) { if (b.commentary) ds.add(b.date); });
    var start = E.get(S, 'start_date');
    return Array.from(ds).filter(function (x) { return !start || x >= start; }).sort().reverse();
  };
  function escH(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mdInline(s) { return escH(s).split('**').map(function (part, i) { return i % 2 ? '<strong>' + part + '</strong>' : part; }).join(''); }
  E.mdToHtml = function (md) {
    return String(md || '').trim().split('\n\n').map(function (para) {
      var lines = para.trim().split('\n');
      if (lines.every(function (l) { return l.indexOf('- ') === 0; })) return '<ul>' + lines.map(function (l) { return '<li>' + mdInline(l.slice(2)) + '</li>'; }).join('') + '</ul>';
      return '<p>' + lines.map(mdInline).join('<br>') + '</p>';
    }).join('\n');
  };
  var SITE_CSS = ':root{--paper:#fbfaf6;--ink:#1c1f22;--muted:#5a5f64;--rule:#b8b2a4;--accent:#7a4219;--bg:#d9d5cc;--display:"Barlow Condensed","Arial Narrow",Impact,sans-serif;--serif:"Source Serif 4",Georgia,"Times New Roman",serif}' +
    '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.5 var(--serif)}.sheet{background:var(--paper);max-width:760px;margin:24px auto;padding:36px 40px;box-shadow:0 10px 40px rgba(0,0,0,.25)}' +
    'header{border-bottom:2px solid var(--ink);padding-bottom:10px;margin-bottom:18px}.eyebrow{font-family:var(--display);font-weight:600;font-size:13px;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);margin:0 0 4px}' +
    'h1{font-family:var(--display);font-weight:700;font-size:40px;line-height:.95;letter-spacing:.04em;text-transform:uppercase;margin:0}h2{font-family:var(--display);font-weight:700;font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:28px 0 6px;padding-bottom:2px;border-bottom:1px solid var(--rule)}' +
    '.date{font-family:var(--display);font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}p{margin:0 0 10px}a{color:var(--accent)}article{margin-top:34px;padding-top:6px;border-top:2px solid var(--ink)}' +
    '@media(max-width:640px){.sheet{margin:0;padding:22px 18px}h1{font-size:32px}}';
  /* the whole blog as one HTML file, newest post first, to save or put on any web host */
  E.exportSite = async function (S) {
    var title = E.get(S, 'blog_title') || 'The Weight Log', intro = E.get(S, 'blog_intro'), fc = E.forecast(S);
    var posts = E.postDates(S).map(function (ds) { return E.post(S, ds, fc); });
    var body = '<header><p class="eyebrow">Daily</p><h1>' + escH(title) + '</h1></header>' + (intro ? E.mdToHtml(intro) : '') +
      posts.map(function (p) {
        return '<article id="' + p.date + '"><h1>' + escH(p.title) + '</h1><div class="date">' + E.longDate(p.date) + '</div>' + E.mdToHtml(p.body_md) +
          (p.commentary ? '<h2>In my own words</h2>' + E.mdToHtml(p.commentary) : '') + '</article>';
      }).join('') + (posts.length ? '' : '<p>Nothing yet.</p>');
    var html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escH(title) + '</title>' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap">' +
      '<style>' + SITE_CSS + '</style></head><body><div class="sheet">' + body + '</div></body></html>';
    var now = new Date().toISOString();
    await S.upsert('blog_posts', posts.map(function (p) {
      var c = S.db.blog_posts.find(function (b) { return b.date === p.date; }) || {};
      return { date: p.date, title: c.title || null, commentary: c.commentary || '', published_at: now, updated_at: c.updated_at || now };
    }));
    return { html: html, posts: posts.length, published_at: now };
  };
})(typeof window !== 'undefined' ? window : globalThis);
