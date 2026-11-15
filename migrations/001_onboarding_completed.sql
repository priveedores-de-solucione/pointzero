-- Run once in the Supabase SQL editor BEFORE deploying the updated backend.
alter table public.pz_profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Backfill: anyone who already has names, or a non-default role, is considered onboarded.
update public.pz_profiles
set onboarding_completed = true
where onboarding_completed = false
  and (
    role <> 'STUDENT'
    or (coalesce(first_name, '') <> '' and coalesce(last_name, '') <> '')
  );
