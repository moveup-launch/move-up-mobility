-- Migration : Personnalisation marque entreprise
-- Exécuter dans Supabase > SQL Editor
-- Idempotent : peut être ré-exécuté sans risque

-- ============================================================
-- 1. Colonnes profiles
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_address   text,
  ADD COLUMN IF NOT EXISTS company_phone     text,
  ADD COLUMN IF NOT EXISTS company_email     text,
  ADD COLUMN IF NOT EXISTS company_website   text,
  ADD COLUMN IF NOT EXISTS company_siret     text,
  ADD COLUMN IF NOT EXISTS company_color     text DEFAULT '#2B6BE6',
  ADD COLUMN IF NOT EXISTS company_logo_url  text;

-- ============================================================
-- 2. Bucket Storage "company-logos" (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- ============================================================
-- 3. Politiques RLS Storage
-- ============================================================

-- Supprimer les anciennes si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Users upload own logo"   ON storage.objects;
DROP POLICY IF EXISTS "Users update own logo"   ON storage.objects;
DROP POLICY IF EXISTS "Users delete own logo"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone reads company logos" ON storage.objects;

-- Upload (INSERT) — utilisateur authentifié, dans son propre dossier
CREATE POLICY "Users upload own logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Mise à jour (UPDATE) — upsert
CREATE POLICY "Users update own logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Suppression (DELETE)
CREATE POLICY "Users delete own logo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Lecture publique (SELECT) — bucket public, pas besoin d'auth
CREATE POLICY "Anyone reads company logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');

-- ============================================================
-- Diagnostic : vérifier que tout est en place
-- ============================================================
-- SELECT id, name, public FROM storage.buckets WHERE id = 'company-logos';
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name LIKE 'company_%';
