# CLAUDE.md — Weight Target (health)

Static site on GitHub Pages (`wcwilkins2025/health`, Pages from `main` at the root), data in a Supabase project with row-level security. Public repo: no personal data, names, numbers or paths in any file or commit. The owner's notes and state files stay in the private local folder `C:\Projects\weight-target\docs\state\`.

## Layout

- `data/library.js` the food library and recipes (`window.HT_LIB`). The only place recipes are edited. Ids are slugs and permanent: plans refer to them. Add, never rename an id.
- `js/store.js` the person's rows in memory (`S.db[table]`), written through to Supabase; `HT.memoryStore()` for tests and the localhost preview.
- `js/engine.js` (`HT.E`) all the arithmetic, ported from the Python app: weight and BP stats, nutrition, planner and shopping list, forecast and fit, the adaptive training week, the workout log, the blog.
- `js/api.js` `HT.route(S, method, path, body)`: the old server's `/api/...` routes answered in the browser. Pages call `api(path, opts)` (in `js/app.js`) exactly as they called the server.
- `js/import.js` Gym ACE and old-app SQLite files read with sql.js in the browser.
- `js/app.js` sign-in check (Supabase session, else `account.html`), welcome gate, nav, `api()`, `importFile()`, `download()`, page helpers.
- `supabase/schema.sql` tables, one "own rows" policy per table, `delete_me()`.
- Plan day and slot ids are numbers made from the plan id: day = plan*10 + day index, slot = plan*100 + day*10 + slot index.

## Conventions

- Dates are local `YYYY-MM-DD`; `HT.now` overrides today in tests.
- Plain JS, no build step. Cache-bust with `?v=` on script and style links when they change.
- Colors and type: paper, ink, oxblood brown, Barlow Condensed + Source Serif 4 (`style.css`). Light only.
- Today first and loud on every day-based view. Phone first for the log and the shopping list.
- Training lives on Training and Log; the dashboard Move line points there.

## Checks

`npm test` (engine and router over the memory store; sql.js for the imports). Preview: `python -m http.server 8792` in this folder, open `http://localhost:8792` — with no Supabase values in `config.js` it runs as one local person in that browser.
