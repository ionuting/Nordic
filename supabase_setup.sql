-- Script SQL pentru configurarea completă a bazei de date Supabase
-- Rulați acest script în Supabase Dashboard -> SQL Editor

-- 1. Creează tabelul Qualifications dacă nu există
CREATE TABLE IF NOT EXISTS public."Qualifications" (
  internal_number bigint PRIMARY KEY,
  name text NOT NULL,
  phone text,
  sr1 boolean DEFAULT false,
  sr2 boolean DEFAULT false,
  orf boolean DEFAULT false,
  mf boolean DEFAULT false,
  ts boolean DEFAULT false,
  ps boolean DEFAULT false,
  st boolean DEFAULT false,
  hm boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Activează Row Level Security
ALTER TABLE public."Qualifications" ENABLE ROW LEVEL SECURITY;

-- 3. Politici de securitate

-- Permite citirea pentru toți utilizatorii (anon și authenticated)
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Qualifications";
CREATE POLICY "Enable read access for all users" ON public."Qualifications"
  FOR SELECT
  USING (true);

-- Permite inserarea pentru utilizatori autentificați
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."Qualifications";
CREATE POLICY "Enable insert for authenticated users" ON public."Qualifications"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permite actualizarea pentru utilizatori autentificați
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."Qualifications";
CREATE POLICY "Enable update for authenticated users" ON public."Qualifications"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permite ștergerea pentru utilizatori autentificați
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."Qualifications";
CREATE POLICY "Enable delete for authenticated users" ON public."Qualifications"
  FOR DELETE
  TO authenticated
  USING (true);

-- 4. Activează Realtime pentru tabel (pentru actualizări în timp real)
ALTER PUBLICATION supabase_realtime ADD TABLE public."Qualifications";

-- 5. Crează funcție pentru actualizare automată a câmpului updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crează trigger pentru actualizare automată
DROP TRIGGER IF EXISTS set_updated_at ON public."Qualifications";
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public."Qualifications"
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Inserează date de test (opțional - decomentează dacă vrei date de test)
/*
INSERT INTO public."Qualifications" (internal_number, name, phone, sr1, sr2, orf, mf, ts, ps, st, hm)
VALUES 
  (1001, 'Ion Popescu', '+40721234567', true, false, true, false, false, false, false, false),
  (1002, 'Maria Ionescu', '+40722345678', false, true, false, true, true, false, false, false),
  (1003, 'Andrei Georgescu', '+40723456789', true, true, true, false, false, true, false, false),
  (1004, 'Elena Dumitrescu', '+40724567890', false, false, false, true, true, true, true, false),
  (1005, 'Mihai Popa', '+40725678901', true, false, true, true, false, false, false, true)
ON CONFLICT (internal_number) DO NOTHING;
*/

-- Verifică configurarea
SELECT 
  tablename, 
  schemaname,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'Qualifications';

-- Afișează politicile active
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'Qualifications';

-- Numără înregistrările
SELECT COUNT(*) as total_members FROM public."Qualifications";
