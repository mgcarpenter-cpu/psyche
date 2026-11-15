-- Give a gift: one row per gift link. Run once in Supabase → SQL Editor.
-- Only the server functions (api/gift.js, api/g.js, api/gift-image.js) read or write this table,
-- using the service-role key, so row level security is on with no policies: the browser can't reach it.

create table if not exists public.gifts (
  id          text primary key,                                     -- the short link: sussuri.com/g/<id>
  sender      uuid references auth.users(id) on delete set null,    -- the member who gave it (credited if the friend joins)
  kind        text not null check (kind in ('know', 'med', 'card')),-- Know yourself, a meditation, or a share card
  meditation  text,                                                 -- the meditation's slug, for kind = 'med'
  from_name   text not null check (char_length(from_name) <= 20),
  message     text not null default '' check (char_length(message) <= 140),
  created_at  timestamptz not null default now()
);

create index if not exists gifts_sender_idx on public.gifts (sender);

alter table public.gifts enable row level security;
