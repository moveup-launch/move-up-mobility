-- Run this in Supabase → SQL Editor
-- ============================================================
-- 1. TABLE VISITS (créer si absente)
-- ============================================================

create table if not exists visits (
  id               uuid        default gen_random_uuid() primary key,
  user_id          uuid        references auth.users(id) on delete cascade not null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  client_name      text,
  client_email     text,
  client_phone     text,
  visit_date       text,
  visit_time       text,
  visit_status     text        default 'prevue',
  agenda_notes     text,
  commercial_name  text,
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

-- Colonnes manquantes (à exécuter si la table existe déjà)
alter table visits add column if not exists visit_time text;
alter table visits add column if not exists visit_status text default 'prevue';
alter table visits add column if not exists agenda_notes text;
alter table visits add column if not exists commercial_name text;

-- Row Level Security
alter table visits enable row level security;

create policy if not exists "Users can manage their own visits"
  on visits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 2. TABLE PHOTOS (Sprint 3)
-- ============================================================

CREATE TABLE IF NOT EXISTS photos (
  id uuid default gen_random_uuid() primary key,
  visit_id uuid references visits(id) on delete cascade,
  room_id text,
  storage_path text,
  comment text,
  category text,
  created_at timestamptz default now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own photos"
  ON photos FOR ALL
  USING (auth.uid() = (SELECT user_id FROM visits WHERE id = visit_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM visits WHERE id = visit_id));

-- ============================================================
-- 3. STORAGE BUCKET "visit-photos" (Sprint 3)
-- ============================================================
-- Créer le bucket via Supabase Dashboard → Storage → New bucket
--   Name: visit-photos
--   Public: false (privé)
--
-- Ou via SQL :

INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-photos', 'visit-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Policies Storage (chemin: {user_id}/{visit_id}/{room_id}/photo-*.jpg)

CREATE POLICY "Users upload their own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'visit-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users read their own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'visit-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users delete their own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'visit-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- ============================================================
-- 4. TABLE PROFILES — colonnes abonnement (Sprint 4)
-- ============================================================
-- Créer la table profiles si absente
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name  text,
  company_name text,
  plan text default 'free',
  stripe_customer_id text,
  subscription_status text default 'inactive'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users manage their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ajouter les colonnes si la table existe déjà
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';
