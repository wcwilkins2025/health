/* Weight Target: the Supabase project that keeps each person's rows.
   Both values are made to be public; the row rules in supabase/schema.sql are what keep each person's data their own.
   The secret (service role) key never goes in this file or anywhere in this repo. */
window.HT_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT-REF.supabase.co',
  supabaseKey: 'YOUR-PUBLISHABLE-KEY'
};
