-- Goals: one row per member holding everything the four Goals pages save
-- (areas + chats + confirmed lines, plan items, schedule, ticks by date). Run once in Supabase → SQL Editor.
-- Row level security: a member can only ever read and write their own row.

create table if not exists public.member_goals (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.member_goals enable row level security;

drop policy if exists "own goals: read"   on public.member_goals;
drop policy if exists "own goals: insert" on public.member_goals;
drop policy if exists "own goals: update" on public.member_goals;

create policy "own goals: read"   on public.member_goals for select using (auth.uid() = user_id);
create policy "own goals: insert" on public.member_goals for insert with check (auth.uid() = user_id);
create policy "own goals: update" on public.member_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Later, the most common library gaps (meditations a plan wanted but the library did not have):
-- select g->>'need' as need, count(*) from public.member_goals, jsonb_array_elements(data->'gaps') g group by 1 order by 2 desc;
