/* Steadfast Health: where a person's rows live while a page is open.
   On load every table is read into memory (HT.db); the engine reads those arrays and writes through
   HT.store, which changes the array and the Supabase table together. Tests use the same store with no
   Supabase client (HT.store.memory()), so the engine runs the same in node and in the browser. */
(function (root) {
  'use strict';
  var HT = root.HT = root.HT || {};

  var TABLES = {   // table: primary key fields
    settings: ['key'], weight_log: ['id'], bp_log: ['id'], foods_custom: ['food_id'], meal_prefs: ['meal_id'],
    plans: ['id'], gym_sets: ['id'], gym_workouts: ['workout', 'exercise'], blog_posts: ['date'], checkins: ['date'],
    ai_messages: ['id'], ai_cards: ['id'], meals_custom: ['meal_id'], pantry: ['food_id']
  };
  HT.TABLES = TABLES;

  function matches(row, where) { for (var k in where) if (String(row[k]) !== String(where[k])) return false; return true; }
  function keyOf(table, row) { var o = {}; TABLES[table].forEach(function (k) { o[k] = row[k]; }); return o; }
  function err(e) { var x = new Error(e.message || String(e)); x.status = 500; return x; }

  function Store(client, userId) {
    this.client = client || null;
    this.userId = userId || null;
    this.db = {};
    this.nextId = 1;
    var self = this;
    Object.keys(TABLES).forEach(function (t) { self.db[t] = []; });
  }

  /* read every table; Supabase hands out 1,000 rows a request, so page through */
  Store.prototype.load = async function () {
    if (!this.client) return this;
    var self = this;
    await Promise.all(Object.keys(TABLES).map(async function (t) {
      var all = [], from = 0, size = 1000;
      for (;;) {
        var r = await self.client.from(t).select('*').range(from, from + size - 1);
        if (r.error) throw err(r.error);
        all = all.concat(r.data);
        if (r.data.length < size) break;
        from += size;
      }
      self.db[t] = all;
    }));
    return this;
  };

  Store.prototype.rows = function (t) { return this.db[t]; };

  /* insert rows; returns them with the ids the database gave */
  Store.prototype.insert = async function (t, rows) {
    var list = Array.isArray(rows) ? rows : [rows];
    if (!list.length) return [];
    var out;
    if (this.client) {
      out = [];
      for (var i = 0; i < list.length; i += 500) {
        var r = await this.client.from(t).insert(list.slice(i, i + 500)).select();
        if (r.error) throw err(r.error);
        out = out.concat(r.data);
      }
    } else {
      var self = this;
      out = list.map(function (row) { var o = Object.assign({}, row); if (TABLES[t][0] === 'id' && o.id == null) o.id = self.nextId++; return o; });
    }
    Array.prototype.push.apply(this.db[t], out);
    this.changed();
    return Array.isArray(rows) ? out : out[0];
  };

  /* insert or replace by primary key */
  Store.prototype.upsert = async function (t, rows) {
    var list = Array.isArray(rows) ? rows : [rows];
    if (!list.length) return [];
    var self = this, out = list;
    if (this.client) {
      var withUser = list.map(function (row) { return Object.assign({ user_id: self.userId }, row); });
      var r = await this.client.from(t).upsert(withUser, { onConflict: ['user_id'].concat(TABLES[t]).join(',') }).select();
      if (r.error) throw err(r.error);
      out = r.data;
    }
    out.forEach(function (row) {
      var k = keyOf(t, row), i = self.db[t].findIndex(function (x) { return matches(x, k); });
      if (i >= 0) self.db[t][i] = Object.assign({}, self.db[t][i], row); else self.db[t].push(Object.assign({}, row));
    });
    this.changed();
    return Array.isArray(rows) ? out : out[0];
  };

  /* change the rows matching where */
  Store.prototype.update = async function (t, where, patch) {
    if (this.client) {
      var q = this.client.from(t).update(patch);
      for (var k in where) q = q.eq(k, where[k]);
      var r = await q;
      if (r.error) throw err(r.error);
    }
    this.db[t].forEach(function (row) { if (matches(row, where)) Object.assign(row, patch); });
    this.changed();
  };

  /* remove the rows matching where (or, with ids, every row whose id is in the list) */
  Store.prototype.remove = async function (t, where) {
    if (this.client) {
      var q = this.client.from(t).delete();
      if (where.ids) {
        for (var i = 0; i < where.ids.length; i += 200) {
          var r1 = await this.client.from(t).delete().in('id', where.ids.slice(i, i + 200));
          if (r1.error) throw err(r1.error);
        }
      } else {
        for (var k in where) q = q.eq(k, where[k]);
        if (!Object.keys(where).length) q = q.eq('user_id', this.userId);
        var r = await q;
        if (r.error) throw err(r.error);
      }
    }
    if (where.ids) { var set = new Set(where.ids.map(String)); this.db[t] = this.db[t].filter(function (x) { return !set.has(String(x.id)); }); }
    else this.db[t] = this.db[t].filter(function (x) { return !matches(x, where); });
    this.changed();
  };

  /* with no Supabase client the store can keep itself in the browser (local preview only) */
  Store.prototype.changed = function () { if (this.onChange) this.onChange(this); };

  HT.Store = Store;
  HT.memoryStore = function () { return new Store(null, null); };
})(typeof window !== 'undefined' ? window : globalThis);
