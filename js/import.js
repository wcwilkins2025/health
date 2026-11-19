/* Steadfast Health: bringing data in from a SQLite file the person picks.
   One kind: the old Weight Target app's database (everything moves over once). The file is read in the browser with sql.js; nothing is uploaded
   except the rows that end up in the person's own tables. */
(function (root) {
  'use strict';
  var HT = root.HT = root.HT || {};
  var E = HT.E;

  function q(db, sql) {
    var r = db.exec(sql);
    if (!r.length) return [];
    var cols = r[0].columns;
    return r[0].values.map(function (v) { var o = {}; cols.forEach(function (c, i) { o[c] = v[i]; }); return o; });
  }
  function hasTable(db, name) { return q(db, "SELECT name FROM sqlite_master WHERE type='table' AND name='" + name + "'").length > 0; }
  function numOrNull(s) {
    if (s === null || s === undefined) return null;
    s = String(s).trim().replace(',', '.');
    if (!s) return null;
    var x = Number(s);
    return isNaN(x) ? null : x;
  }

  E.openSqlite = async function (bytes) {
    if (!root.initSqlJs) throw E.bad('The SQLite reader did not load; check the connection and try again', 500);
    HT._SQL = HT._SQL || await root.initSqlJs({ locateFile: function (f) { return 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/' + f; } });
    return new HT._SQL.Database(new Uint8Array(bytes));
  };
  E.kindOf = function (db) {
    if (hasTable(db, 'weight_log') && hasTable(db, 'gym_sets')) return 'old';
    return null;
  };

  /* The old Weight Target database (data/users/1.db or data/weight-target.db): replaces this person's rows with its contents.
     Foods and meals are matched by name to the library; paths on the old PC and the Bring! login are not brought over. */
  var FOOD_RENAMES = { 'Ribeye steak': 'Sirloin steak' }, MEAL_RENAMES = { 'Ribeye with asparagus': 'Sirloin with asparagus' };
  var SKIP_SETTINGS = { gymace_db_path: 1, my_code_path: 1, blog_publish_dir: 1, bring_email: 1, bring_password: 1, bring_list_uuid: 1, bring_list_name: 1 };
  E.importOldApp = async function (S, db) {
    var lib = root.HT_LIB, foodByName = {}, mealByName = {};
    lib.foods.forEach(function (f) { foodByName[f.name] = f; });
    lib.meals.forEach(function (m) { mealByName[m.name] = m; });
    var oldFoods = {}, oldMeals = {};
    q(db, 'SELECT * FROM foods').forEach(function (f) { oldFoods[f.id] = f; });
    q(db, 'SELECT id, name, enabled FROM meals').forEach(function (m) { oldMeals[m.id] = m; });
    function foodId(oldId) { var f = oldFoods[oldId]; if (!f) return null; var n = FOOD_RENAMES[f.name] || f.name; return foodByName[n] ? foodByName[n].id : null; }
    function mealId(oldId) { var m = oldMeals[oldId]; if (!m) return null; var n = MEAL_RENAMES[m.name] || m.name; return mealByName[n] ? mealByName[n].id : null; }

    // wipe, then write
    var t;
    for (t in HT.TABLES) await S.remove(t, {});
    var settings = q(db, 'SELECT key, value FROM settings').filter(function (r) { return !SKIP_SETTINGS[r.key] && E.SETTING_KEYS.indexOf(r.key) >= 0; });
    if (!settings.some(function (r) { return r.key === 'setup_done'; })) settings.push({ key: 'setup_done', value: '1' });
    await S.upsert('settings', settings.map(function (r) { return { key: r.key, value: String(r.value) }; }));
    await S.insert('weight_log', q(db, 'SELECT date, weight, note FROM weight_log ORDER BY date').map(function (r) { return { date: r.date, weight: r.weight, note: r.note || '' }; }));
    await S.insert('bp_log', q(db, 'SELECT taken_at, systolic, diastolic, pulse, context, note FROM bp_log ORDER BY taken_at').map(function (r) {
      return { taken_at: r.taken_at, systolic: r.systolic, diastolic: r.diastolic, pulse: r.pulse, context: r.context || 'morning', note: r.note || '' }; }));

    // the library's food notes before they were rewritten (2026-11-15), so the old app's copies of them are not taken for edits
    var PREVIOUS_NOTES = {"bacon":"","breakfast-sausage":"Check label for sugar","jimmy-dean-sausage-patties":"Original. Fresh or fully cooked","italian-sausage":"","pepperoni":"","salami":"","deli-turkey":"No sugar added, under 1g carb","deli-ham":"No honey or brown sugar glaze","mayonnaise":"Real mayo, not light","ranch-dressing":"Full fat","blue-cheese-dressing":"","caesar-dressing":"","light-italian-dressing":"Check the label: under 3 g sugar"};
    // foods: unlock state and notes that differ from the library; foods added in the old app come over as the person's own
    var custom = [];
    Object.values(oldFoods).forEach(function (f) {
      var id = foodId(f.id);
      if (id) {
        var L = lib.foods.find(function (x) { return x.id === id; }), d = {};
        if (!!f.unlocked !== !!L.unlocked) d.unlocked = !!f.unlocked;
        var oldNote = f.note || '';   // an empty note, or the library's earlier wording, is not the person's edit
        if (oldNote && oldNote !== (L.note || '') && oldNote !== (PREVIOUS_NOTES[id] || '')) d.note = oldNote;
        if (f.light !== L.light) d.light = f.light;
        if ((f.store_section || '') !== (L.store_section || '')) d.store_section = f.store_section;
        if (Object.keys(d).length) custom.push({ food_id: id, data: d });
      } else {
        custom.push({ food_id: 'u-old-' + f.id, data: { name: f.name, category: f.category, light: f.light, carbs_per_serving: f.carbs_per_serving || 0, serving: f.serving || '',
          store_section: f.store_section || 'Other', note: f.note || '', unlocked: !!f.unlocked, kcal_100: f.kcal_100, protein_100: f.protein_100, fat_100: f.fat_100, carbs_100: f.carbs_100,
          unit_grams: JSON.parse(f.unit_grams || '{}') } });
      }
    });
    await S.upsert('foods_custom', custom);
    await S.upsert('meal_prefs', Object.values(oldMeals).filter(function (m) { return !m.enabled && mealId(m.id); }).map(function (m) { return { meal_id: mealId(m.id), enabled: false }; }));

    // plans with their days, slots and shopping checks
    var plans = q(db, 'SELECT * FROM plans ORDER BY week_start'), skipped = 0;
    var dayRows = q(db, 'SELECT * FROM plan_days ORDER BY date'), slotRows = q(db, 'SELECT * FROM plan_slots'), checkRows = q(db, 'SELECT * FROM shopping_checks WHERE checked = 1');
    await S.insert('plans', plans.map(function (p) {
      var days = dayRows.filter(function (d) { return d.plan_id === p.id; }).map(function (d) {
        return { date: d.date, away: !!d.away, slots: E.SLOTS.map(function (slot) {
          var s = slotRows.find(function (x) { return x.plan_day_id === d.id && x.slot === slot; });
          var mid = s && s.meal_id != null ? mealId(s.meal_id) : null;
          if (s && s.meal_id != null && !mid) skipped++;
          return { slot: slot, meal_id: mid };
        }) };
      });
      var checks = {};
      checkRows.filter(function (c) { return c.plan_id === p.id; }).forEach(function (c) { var f = foodId(c.food_id); if (f) checks[f] = true; });
      return { week_start: p.week_start, created_at: new Date(p.created_at).toISOString(), days: days, checks: checks };
    }));

    var gs = q(db, 'SELECT gymace_id, session_ms, set_ms, date, workout, exercise, weight, reps, note FROM gym_sets ORDER BY set_ms');
    await S.insert('gym_sets', gs.map(function (r) { return { gymace_id: r.gymace_id, session_ms: r.session_ms, set_ms: r.set_ms, date: r.date, workout: r.workout || '', exercise: r.exercise, weight: r.weight, reps: r.reps, note: r.note || '' }; }));
    var hasTargets = q(db, 'PRAGMA table_info(gym_workouts)').some(function (c) { return c.name === 'target_sets'; });
    var gw = q(db, 'SELECT workout, exercise, ord, note' + (hasTargets ? ', target_sets, target_reps' : '') + ' FROM gym_workouts');
    await S.upsert('gym_workouts', gw.map(function (r) { return { workout: r.workout, exercise: r.exercise, ord: r.ord || 0, note: r.note || '', target_sets: r.target_sets == null ? null : r.target_sets, target_reps: r.target_reps == null ? null : r.target_reps }; }));
    await S.upsert('blog_posts', q(db, 'SELECT date, title, commentary, published_at, updated_at FROM blog_posts').map(function (r) {
      return { date: r.date, title: r.title, commentary: r.commentary || '', published_at: r.published_at ? new Date(r.published_at).toISOString() : null, updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null }; }));
    return { kind: 'old', weigh_ins: S.db.weight_log.length, bp: S.db.bp_log.length, plans: S.db.plans.length, sets: S.db.gym_sets.length,
      workouts: new Set(S.db.gym_workouts.map(function (r) { return r.workout; })).size, posts: S.db.blog_posts.length, slots_without_meal: skipped };
  };
})(typeof window !== 'undefined' ? window : globalThis);
