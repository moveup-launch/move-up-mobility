-- Run this in Supabase → SQL Editor

create table if not exists visits (
  id               uuid        default gen_random_uuid() primary key,
  user_id          uuid        references auth.users(id) on delete cascade not null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  client_name      text,
  client_email     text,
  client_phone     text,
  visit_date       text,
  move_date        text,
  total_volume     numeric,
  recommended_truck text,
  client_data      jsonb,
  origin_data      jsonb,
  destination_data jsonb,
  rooms_data       jsonb,
  boxes_done       jsonb,
  boxes_remaining  jsonb
);

-- Row Level Security: each user sees only their own visits
alter table visits enable row level security;

create policy "Users can manage their own visits"
  on visits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
