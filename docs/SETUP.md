# Setup

Four steps, about 20 minutes. Use a personal Supabase account.

## 1. The Supabase project

1. supabase.com → **New project**. Name it `health`, choose a region near you, set a database password (you will not need it again). Wait for it to finish.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql`, press **Run**. It makes the tables and the rule that each person sees only their own rows. Safe to run again after an update.
3. **Authentication → Sign In / Providers**: Email on. Under **Sign In / Up**, turn **Allow new users to sign up** off. Only people you invite get in.
4. **Authentication → URL Configuration**:
   - Site URL: `https://wcwilkins2025.github.io/health/account.html`
   - Redirect URLs: add `https://wcwilkins2025.github.io/health/account.html` and, for checking changes on the PC, `http://localhost:8792/account.html`.
   Invite, sign-in-link and password-reset emails all land on `account.html`, which finishes the step and opens the app.
5. **Project Settings → API Keys**: copy the **Project URL** and the **publishable** key (starts `sb_publishable_`, or the legacy `anon` key). Both are public by design.

## 2. Point the site at it

Put the two values in `config.js`, commit and push. GitHub Pages republishes in a minute or two.

## 3. Your own account, and your old data

1. **Authentication → Users → Add user → Create new user**: your email and a password, tick **Auto confirm**.
2. Open `https://wcwilkins2025.github.io/health/`, sign in.
3. The welcome page asks for your numbers. To bring over everything from the old app instead, skip it by going straight to **account.html**, pick the old database file under **Bring in old data** (`C:\Projects\weight-target\data\users\1.db`) and press **Import**. Weigh-ins, blood pressure, plans and shopping checks, workouts, settings and blog notes come over. Paths on the old PC and the Bring! login do not.
4. On the phone: open the address, sign in, then Share → **Add to Home Screen** (iPhone) or the browser menu → **Install app** (Android).

## 4. Inviting someone

**Authentication → Users → Invite user**, type their email. They get a link, choose a password on `account.html`, fill in the welcome page, and start with their own empty log. Each person's rows are theirs alone.

The free tier's mailer sends a few emails an hour, enough for a small group. For more, add custom SMTP under **Authentication → Emails**.

## Gym ACE

Training → **Import from Gym ACE** → pick the GymACE.db file (on Windows it is in `%LOCALAPPDATA%\Packages\16549Appatary.GymACE_*\LocalState\`). New sets are added, edited ones updated, deleted ones removed. Sets logged in the app are never touched. The file is read in the browser; only the rows are saved.

## After an update

When a change adds a table (the daily check-in did), open **SQL Editor**, paste all of `supabase/schema.sql` again and press **Run**. It only adds what is missing; nothing that is there is touched.

## What changed from the old app

- The Python server on the PC is gone. Nothing needs to be running.
- Sending the list to Bring! is now **Copy the list**: paste it into Bring!, Notes or a message.
- Publishing the blog saves one HTML page with every post, to put on any web host.
- My Code is kept with your account (Account page) instead of read from OneDrive.
- New: the **Check-in** page, with water and protein goals. Protein left blank follows the target weight, 1 g per pound of it.
