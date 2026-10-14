-- Supabase Schema Migration: Multiplayer Lobbies and Rooms for Island Haat
-- Run in Supabase SQL Editor if database-backed persistence is desired.

create table if not exists public.rooms (
  id text primary key,
  code text unique not null,
  name text not null,
  host_id text not null,
  status text not null default 'waiting' check (status in ('waiting', 'starting', 'in_game', 'closed')),
  max_players int not null default 6,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rooms_code on public.rooms(code);
create index if not exists idx_rooms_status on public.rooms(status);

create table if not exists public.room_players (
  id text primary key,
  room_id text not null references public.rooms(id) on delete cascade,
  player_id text not null,
  player_name text not null,
  culture text check (culture in ('bihar', 'maharashtra', 'west_bengal', 'karnataka', 'gujarat', 'rajasthan')),
  is_ready boolean not null default false,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  constraint uq_room_player unique (room_id, player_id),
  constraint uq_room_culture unique (room_id, culture)
);

create index if not exists idx_room_players_room_id on public.room_players(room_id);

-- Enable Row Level Security
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;

-- Policies: Anonymous players with publishable key can read/create/update rooms
create policy "Allow all read active rooms" on public.rooms
  for select using (true);

create policy "Allow all create rooms" on public.rooms
  for insert with check (true);

create policy "Allow update rooms" on public.rooms
  for update using (true);

create policy "Allow all read room players" on public.room_players
  for select using (true);

create policy "Allow all insert room players" on public.room_players
  for insert with check (true);

create policy "Allow all update room players" on public.room_players
  for update using (true);

create policy "Allow delete room players" on public.room_players
  for delete using (true);
