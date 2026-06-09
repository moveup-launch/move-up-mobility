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
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- ============================================================
-- ADMIN : vue + fonctions (exécuter dans Supabase SQL Editor)
-- ============================================================

-- Vue admin_users (pour requêtes SQL directes)
CREATE OR REPLACE VIEW admin_users AS
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.company_name,
  p.plan,
  p.is_admin,
  p.created_at,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id;

-- Fonction get_admin_users() — SECURITY DEFINER pour accéder à auth.users
-- Retourne la liste uniquement si l'appelant est admin
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE(
  id            uuid,
  email         text,
  first_name    text,
  last_name     text,
  company_name  text,
  plan          text,
  is_admin      boolean,
  created_at    timestamptz,
  visit_count   bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT
    p.id,
    u.email::text,
    p.first_name,
    p.last_name,
    p.company_name,
    p.plan,
    p.is_admin,
    p.created_at,
    (SELECT COUNT(*) FROM visits v WHERE v.user_id = p.id)::bigint AS visit_count
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE EXISTS (
    SELECT 1 FROM profiles ap WHERE ap.id = auth.uid() AND ap.is_admin = true
  )
  ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;

-- Fonction admin_set_user_plan() — modifie le plan d'un utilisateur
CREATE OR REPLACE FUNCTION admin_set_user_plan(target_user_id uuid, new_plan text)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;
  UPDATE profiles SET plan = new_plan WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_set_user_plan(uuid, text) TO authenticated;

-- ============================================================
-- COMPTE DÉMO (exécuter après avoir créé demo@moveupapp.com
-- dans Supabase Auth → Users → Add user
-- Email: demo@moveupapp.com  Password: Demo1234!)
-- ============================================================

-- Profil Jean Dupont (plan pro pour montrer toutes les fonctionnalités)
UPDATE profiles SET
  first_name = 'Jean',
  last_name = 'Dupont',
  company_name = 'Déménagements Dupont & Fils',
  plan = 'pro'
WHERE id = (SELECT id FROM auth.users WHERE email = 'demo@moveupapp.com');

-- Nettoyage si re-exécution
DELETE FROM visits
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@moveupapp.com');

-- Visite 1 : Marie Lambert — Lyon → Paris (terminée, il y a 3 mois)
INSERT INTO visits (user_id, client_name, client_email, client_phone, visit_date, visit_time, visit_status, total_volume, recommended_truck, client_data, origin_data, destination_data, rooms_data)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo@moveupapp.com'),
  'Marie Lambert', 'marie.lambert@email.fr', '06 12 34 56 78',
  '2026-03-15', '09:30', 'termine', 38.5, '40m³',
  '{"name":"Marie Lambert","phone":"06 12 34 56 78","email":"marie.lambert@email.fr","visitDate":"2026-03-15","visitTime":"09:30","visitStatus":"termine","surveyor":"Jean Dupont","moveDate":"2026-04-01","housingType":"appartement","moveType":"local","householdPersons":2,"notes":"Piano droit au salon — prévoir monte-meuble"}',
  '{"address":"12 rue des Lilas","city":"Lyon","postalCode":"69003","floor":"3","elevator":"yes","elevatorUsable":"yes","elevatorSize":"small","parkingAvailable":"yes","accessDifficult":"no","truckDistance":"lt10","accessNotes":"Ascenseur étroit, démonter le canapé"}',
  '{"address":"8 avenue Foch","city":"Paris","postalCode":"75016","floor":"0","elevator":"no","elevatorUsable":"toCheck","parkingAvailable":"yes","accessDifficult":"no","truckDistance":"lt10","accessNotes":"Maison de ville, accès direct côté rue"}',
  '[{"id":"room_1","type":"salon","name":"Salon","items":[{"itemId":"canape","qty":1,"name":"Canapé 3 places","volume_m3":1.5},{"itemId":"piano","qty":1,"name":"Piano droit","volume_m3":2.5},{"itemId":"meuble_tv","qty":1,"name":"Meuble TV","volume_m3":0.8},{"itemId":"table_basse","qty":1,"name":"Table basse","volume_m3":0.3}]},{"id":"room_2","type":"chambre","name":"Chambre principale","items":[{"itemId":"lit","qty":1,"name":"Lit 160×200 + sommier","volume_m3":1.8},{"itemId":"armoire","qty":1,"name":"Armoire 3 portes","volume_m3":2.0},{"itemId":"commode","qty":1,"name":"Commode","volume_m3":0.6}]},{"id":"room_3","type":"chambre","name":"Chambre enfant","items":[{"itemId":"lit_enfant","qty":1,"name":"Lit 90×200","volume_m3":0.8},{"itemId":"bureau","qty":1,"name":"Bureau enfant","volume_m3":0.7},{"itemId":"etagere","qty":2,"name":"Étagère","volume_m3":0.4}]},{"id":"room_4","type":"cuisine","name":"Cuisine","items":[{"itemId":"frigo","qty":1,"name":"Réfrigérateur combiné","volume_m3":0.8},{"itemId":"maching_laver","qty":1,"name":"Machine à laver","volume_m3":0.6},{"itemId":"lave_vaisselle","qty":1,"name":"Lave-vaisselle","volume_m3":0.6}]}]'
);

-- Visite 2 : Thomas Martin — Marseille → Toulouse (terminée, il y a 2 mois)
INSERT INTO visits (user_id, client_name, client_email, client_phone, visit_date, visit_time, visit_status, total_volume, recommended_truck, client_data, origin_data, destination_data, rooms_data)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo@moveupapp.com'),
  'Thomas Martin', 'thomas.martin@email.fr', '07 23 45 67 89',
  '2026-04-20', '14:00', 'termine', 52.0, '60m³',
  '{"name":"Thomas Martin","phone":"07 23 45 67 89","email":"thomas.martin@email.fr","visitDate":"2026-04-20","visitTime":"14:00","visitStatus":"termine","surveyor":"Jean Dupont","moveDate":"2026-05-10","housingType":"maison","moveType":"local","householdPersons":4,"notes":"Cave avec beaucoup de cartons — prévoir équipe de 4"}',
  '{"address":"45 boulevard Michelet","city":"Marseille","postalCode":"13008","floor":"0","elevator":"no","parkingAvailable":"yes","accessDifficult":"no","truckDistance":"lt10","accessNotes":"Maison individuelle, accès facile par l allée"}',
  '{"address":"22 rue du Taur","city":"Toulouse","postalCode":"31000","floor":"1","elevator":"no","parkingAvailable":"toCheck","accessDifficult":"yes","truckDistance":"lt10","accessNotes":"Rue piétonne — stationnement camion à négocier avec mairie"}',
  '[{"id":"room_1","type":"salon","name":"Salon","items":[{"itemId":"canape","qty":1,"name":"Canapé d angle","volume_m3":2.8},{"itemId":"table","qty":1,"name":"Table à manger 8 couverts","volume_m3":1.2},{"itemId":"chaises","qty":6,"name":"Chaise","volume_m3":0.2}]},{"id":"room_2","type":"chambre","name":"Chambre parents","items":[{"itemId":"lit","qty":1,"name":"Lit 180×200","volume_m3":2.2},{"itemId":"armoire","qty":2,"name":"Armoire","volume_m3":1.8}]},{"id":"room_3","type":"chambre","name":"Chambre 1","items":[{"itemId":"lit","qty":1,"name":"Lit 90×190","volume_m3":0.8},{"itemId":"bureau","qty":1,"name":"Bureau","volume_m3":0.9}]},{"id":"room_4","type":"chambre","name":"Chambre 2","items":[{"itemId":"lit","qty":1,"name":"Lit 90×190","volume_m3":0.8},{"itemId":"armoire","qty":1,"name":"Armoire","volume_m3":1.2}]},{"id":"room_5","type":"cave","name":"Cave / Débarras","items":[{"itemId":"cartons","qty":30,"name":"Carton standard","volume_m3":0.1},{"itemId":"velo","qty":2,"name":"Vélo","volume_m3":0.5},{"itemId":"outillage","qty":1,"name":"Établi + outils","volume_m3":1.5}]}]'
);

-- Visite 3 : Sophie Leclerc — Nantes → Bordeaux (terminée, il y a 1 mois)
INSERT INTO visits (user_id, client_name, client_email, client_phone, visit_date, visit_time, visit_status, total_volume, recommended_truck, client_data, origin_data, destination_data, rooms_data)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo@moveupapp.com'),
  'Sophie Leclerc', 'sophie.leclerc@email.fr', '06 78 90 12 34',
  '2026-05-08', '10:00', 'termine', 19.5, '20m³',
  '{"name":"Sophie Leclerc","phone":"06 78 90 12 34","email":"sophie.leclerc@email.fr","visitDate":"2026-05-08","visitTime":"10:00","visitStatus":"termine","surveyor":"Jean Dupont","moveDate":"2026-05-25","housingType":"appartement","moveType":"local","householdPersons":1,"notes":"Studio — déménagement rapide, 1 journée suffira"}',
  '{"address":"3 passage de la Bonne Graine","city":"Nantes","postalCode":"44000","floor":"2","elevator":"no","parkingAvailable":"yes","accessDifficult":"no","truckDistance":"lt10","accessNotes":"Escalier étroit — attention canapé convertible"}',
  '{"address":"17 cours de l Intendance","city":"Bordeaux","postalCode":"33000","floor":"4","elevator":"yes","elevatorUsable":"yes","elevatorSize":"large","parkingAvailable":"yes","accessDifficult":"no","truckDistance":"lt10","accessNotes":"Immeuble haussmannien, grand ascenseur"}',
  '[{"id":"room_1","type":"salon","name":"Séjour","items":[{"itemId":"canape","qty":1,"name":"Canapé convertible","volume_m3":1.8},{"itemId":"etagere","qty":1,"name":"Bibliothèque Billy","volume_m3":0.6},{"itemId":"bureau","qty":1,"name":"Bureau","volume_m3":0.7}]},{"id":"room_2","type":"chambre","name":"Chambre","items":[{"itemId":"lit","qty":1,"name":"Lit 140×200","volume_m3":1.4},{"itemId":"armoire","qty":1,"name":"Penderie","volume_m3":0.8}]},{"id":"room_3","type":"cuisine","name":"Cuisine","items":[{"itemId":"frigo","qty":1,"name":"Réfrigérateur","volume_m3":0.7},{"itemId":"micro_ondes","qty":1,"name":"Micro-ondes","volume_m3":0.1}]}]'
);

-- Visite 4 : Pierre Dubois — Rennes → Paris (à venir, dans 2 semaines)
INSERT INTO visits (user_id, client_name, client_email, client_phone, visit_date, visit_time, visit_status, total_volume, client_data, origin_data, destination_data, rooms_data)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo@moveupapp.com'),
  'Pierre Dubois', 'pierre.dubois@email.fr', '06 34 56 78 90',
  '2026-06-23', '09:00', 'prevue', NULL,
  '{"name":"Pierre Dubois","phone":"06 34 56 78 90","email":"pierre.dubois@email.fr","visitDate":"2026-06-23","visitTime":"09:00","visitStatus":"prevue","surveyor":"Jean Dupont","moveDate":"2026-07-15","housingType":"maison","moveType":"local","householdPersons":3,"notes":"Maison 5 pièces — inventaire à faire sur place"}',
  '{"address":"14 rue de Bretagne","city":"Rennes","postalCode":"35000","floor":"0","elevator":"no","parkingAvailable":"yes","accessDifficult":"no","truckDistance":"lt10"}',
  '{"address":"56 rue de la Roquette","city":"Paris","postalCode":"75011","floor":"3","elevator":"yes","elevatorUsable":"yes","parkingAvailable":"toCheck","accessDifficult":"toCheck","truckDistance":"lt10"}',
  '[]'
);

-- Visite 5 : Isabelle Petit — Nice → Lyon (à venir, dans 5 semaines)
INSERT INTO visits (user_id, client_name, client_email, client_phone, visit_date, visit_time, visit_status, total_volume, client_data, origin_data, destination_data, rooms_data)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo@moveupapp.com'),
  'Isabelle Petit', 'isabelle.petit@email.fr', '07 89 01 23 45',
  '2026-07-14', '11:00', 'prevue', NULL,
  '{"name":"Isabelle Petit","phone":"07 89 01 23 45","email":"isabelle.petit@email.fr","visitDate":"2026-07-14","visitTime":"11:00","visitStatus":"prevue","surveyor":"Jean Dupont","moveDate":"2026-08-01","housingType":"appartement","moveType":"local","householdPersons":2,"notes":"Appartement vue mer — garde-meubles 1 mois entre les deux logements"}',
  '{"address":"2 promenade des Anglais","city":"Nice","postalCode":"06000","floor":"5","elevator":"yes","elevatorUsable":"yes","elevatorSize":"large","parkingAvailable":"yes","accessDifficult":"no","truckDistance":"lt10","accessNotes":"Résidence sécurisée — demander badge gardien"}',
  '{"address":"9 place Bellecour","city":"Lyon","postalCode":"69002","floor":"2","elevator":"no","parkingAvailable":"toCheck","accessDifficult":"toCheck","truckDistance":"lt10"}',
  '[]'
);

-- Pour activer votre compte admin (remplacer l'email) :
-- UPDATE profiles SET is_admin = true WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'votre@email.com'
-- );
