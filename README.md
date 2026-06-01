# NRL Tipping App

This is a Vite + React app connected to Supabase.

## Vercel environment variables

Add these in Vercel > Project > Settings > Environment Variables:

VITE_SUPABASE_URL=https://nbckrrqyhujdmybrbbqu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Xi3iiH1iX93WBpxcOOcpyA_Sej6VMtB

## Local development

npm install
npm run dev

## Important

You have already run the Supabase SQL setup. After you create your own account in the app, run this in Supabase SQL Editor:

update public.profiles
set role = 'admin'
where email = 'YOUR_EMAIL_HERE';
