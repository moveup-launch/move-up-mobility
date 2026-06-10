-- Migration : Personnalisation marque entreprise
-- Exécuter dans Supabase > SQL Editor

-- 1. Nouvelles colonnes dans profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_address   text,
  ADD COLUMN IF NOT EXISTS company_phone     text,
  ADD COLUMN IF NOT EXISTS company_email     text,
  ADD COLUMN IF NOT EXISTS company_website   text,
  ADD COLUMN IF NOT EXISTS company_siret     text,
  ADD COLUMN IF NOT EXISTS company_color     text DEFAULT '#2B6BE6',
  ADD COLUMN IF NOT EXISTS company_logo_url  text;

-- 2. Bucket Supabase Storage pour les logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 3. Politiques RLS sur le bucket company-logos
CREATE POLICY IF NOT EXISTS "Users upload own logo"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users update own logo"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users delete own logo"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Anyone reads company logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');
