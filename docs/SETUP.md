# Setup

Four steps, about 20 minutes. Use a personal Supabase account.

## 1. The Supabase project

1. supabase.com → **New project**. Name it `health`, choose a region near you, set a database password (you will not need it again). Wait for it to finish.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql`, press **Run**. It makes the tables and the rule that each person sees only their own rows. Safe to run again after an update.
3. **Authentication → Sign In / Providers**: Email on. Under **Sign In / Up**, turn **Allow new users to sign up** on, with **Confirm email** on. Anyone can create an account; people you invite (Authentication → Users → Invite user) use your AI key, everyone else brings their own.
4. **Authentication → URL Configuration**:
   - Site URL: `https://steadfasthealth.org/account.html`
   - Redirect URLs: add `https://steadfasthealth.org/account.html` and, for checking changes on the PC, `http://localhost:8792/account.html`.
   Sign-in is a 6-digit emailed code typed on `account.html`; there are no passwords and no links in the emails (work mail and some phones open every link to check it, which used up the sign-in).
   - **Authentication → Sign In / Providers → Email**: Email OTP length **6**.
   - **Authentication → Emails → Templates**, both **Magic link or OTP** and **Confirm sign up**: subject `Your Steadfast Health code: {{ .Token }}`, body with the code large and no `{{ .ConfirmationURL }}` and no link at all.
5. **Project Settings → API Keys**: copy the **Project URL** and the **publishable** key (starts `sb_publishable_`, or the legacy `anon` key). Both are public by design.

## 2. Point the site at it

Put the two values in `config.js`, commit and push. GitHub Pages republishes in a minute or two.

## 3. Your own account, and your old data

1. Open `https://steadfasthealth.org/`, choose **Create a free account**, type your email and the 6-digit code from the email.
3. The welcome page asks for your numbers. To bring over everything from the old app instead, skip it by going straight to **account.html**, pick the old database file under **Bring in old data** (`C:\Projects\weight-target\data\users\1.db`) and press **Import**. Weigh-ins, blood pressure, plans and shopping checks, workouts, settings and blog notes come over. Paths on the old PC and the Bring! login do not.
4. On the phone: open the address, sign in, then Share → **Add to Home Screen** (iPhone) or the browser menu → **Install app** (Android).

## 4. Inviting someone

**Authentication → Users → Invite user**, type their email. The invite makes their account, so they can ignore its link: they open the site, choose Sign in and type the 6-digit code. They fill in the welcome page and start with their own empty log. Each person's rows are theirs alone.

The free tier's mailer sends a few emails an hour: enough for invites, not for a public launch. Before inviting the public, add custom SMTP under **Authentication → Emails** (for example a free Resend account with the domain verified in Cloudflare).

## 5. The AI: coach, My Code builder, kitchen helper

The AI runs in a Supabase Edge Function, `supabase/functions/ai`, so the key never reaches a browser.

1. Run `supabase/schema.sql` again (it adds the AI and kitchen tables; nothing existing is touched).
2. Deploy the function, from a terminal in this folder:
   ```
   npx supabase login
   npx supabase functions deploy ai --project-ref YOUR-PROJECT-REF
   ```
   The project ref is the part of the Project URL before `.supabase.co`.
3. Make yourself the owner, once, in the SQL Editor (use your own sign-in email):
   ```sql
   insert into public.app_owners (user_id) select id from auth.users where email = 'YOUR-EMAIL' on conflict do nothing;
   ```
   The owner's key serves the owner and the people the owner invites. Everyone who signs up on their own sets their own key on the same AI setup page and never touches yours.
   Then sign in to the app and open **AI setup** (`ai-setup.html`).
4. Quick setup: press one of the Get a key buttons, create a key there, paste it, press **Set it up**. The app recognizes the provider (Claude, Grok, Groq, Gemini or OpenAI), picks a low-cost model and tests it.
5. Keeping the cost down: the quality setting starts at Lowest cost, and each invited person is limited to 25 AI messages a day on your key (you are not; people with their own key are not). Both are on the same page, with this month's use of your key.

Groq and Gemini can be tried for free. Claude gives the best coaching; on the lowest tier (Claude Haiku) a month of daily use by one person is a few cents to a dollar or two.

## After an update

When a change adds a table (the daily check-in did), open **SQL Editor**, paste all of `supabase/schema.sql` again and press **Run**. It only adds what is missing; nothing that is there is touched.

## What changed from the old app

- The Python server on the PC is gone. Nothing needs to be running.
- Sending the list to Bring! is now **Copy the list**: paste it into Bring!, Notes or a message.
- Publishing the blog saves one HTML page with every post, to put on any web host.
- My Code is kept with your account (Account page) instead of read from OneDrive.
- New: the **Check-in** page, with water and protein goals. Protein left blank follows the target weight, 1 g per pound of it.
