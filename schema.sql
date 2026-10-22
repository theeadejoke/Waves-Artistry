-- Run once in Supabase: SQL Editor > New query > paste > Run
create table if not exists staff (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'staff' check (role in ('owner','staff'))
);
create table if not exists docs (
  col text not null,            -- svc | cus | ap | tx | cfg
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);
alter table staff enable row level security;
alter table docs enable row level security;

create or replace function is_staff() returns boolean language sql security definer stable set search_path=public
as $$ select exists(select 1 from staff where user_id = auth.uid()) $$;
create or replace function is_owner() returns boolean language sql security definer stable set search_path=public
as $$ select exists(select 1 from staff where user_id = auth.uid() and role='owner') $$;

create policy staff_self on staff for select using (user_id = auth.uid());
-- Public site may read services and business settings only
create policy docs_read on docs for select using (col in ('svc','cfg') or is_staff());
-- Owner edits services and settings; any staff edits customers, appointments, transactions
create policy docs_ins on docs for insert with check ((col in ('svc','cfg') and is_owner()) or (col not in ('svc','cfg') and is_staff()));
create policy docs_upd on docs for update using ((col in ('svc','cfg') and is_owner()) or (col not in ('svc','cfg') and is_staff()))
  with check ((col in ('svc','cfg') and is_owner()) or (col not in ('svc','cfg') and is_staff()));
create policy docs_del on docs for delete using (is_owner());
alter publication supabase_realtime add table docs;

-- After creating your login in Authentication > Users, make yourself owner:
-- insert into staff (user_id, role) select id, 'owner' from auth.users where email = 'YOUR@EMAIL';
