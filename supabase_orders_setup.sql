-- SQL Script pentru tabelul Orders (Weekly Tasks)
-- Replicates Godot WeeklyTaskNode structure

-- 0. Șterge tabelul existent (dacă există)
DROP TABLE IF EXISTS public."Orders" CASCADE;

-- 1. Creează tabelul Orders
CREATE TABLE public."Orders" (
  id text PRIMARY KEY,
  order_number text,
  week_number integer NOT NULL DEFAULT 1,
  location text,
  location_latitude double precision DEFAULT 55.6761,
  location_longitude double precision DEFAULT 12.5683,
  notes text,
  daily_schedule jsonb DEFAULT '[]'::jsonb,
  role_assignments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Activează Row Level Security
ALTER TABLE public."Orders" ENABLE ROW LEVEL SECURITY;

-- 3. Politici de securitate

-- Permite citirea pentru toți utilizatorii
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Orders";
CREATE POLICY "Enable read access for all users" ON public."Orders"
  FOR SELECT
  USING (true);

-- Permite inserarea pentru toți utilizatorii (sau authenticated pentru producție)
DROP POLICY IF EXISTS "Enable insert for all users" ON public."Orders";
CREATE POLICY "Enable insert for all users" ON public."Orders"
  FOR INSERT
  WITH CHECK (true);

-- Permite actualizarea pentru toți utilizatorii
DROP POLICY IF EXISTS "Enable update for all users" ON public."Orders";
CREATE POLICY "Enable update for all users" ON public."Orders"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Permite ștergerea pentru toți utilizatorii
DROP POLICY IF EXISTS "Enable delete for all users" ON public."Orders";
CREATE POLICY "Enable delete for all users" ON public."Orders"
  FOR DELETE
  USING (true);

-- 4. Crează funcție pentru actualizare automată a câmpului updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crează trigger pentru actualizare automată updated_at
DROP TRIGGER IF EXISTS set_updated_at_orders ON public."Orders";
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public."Orders"
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Activează Realtime pentru tabel
ALTER PUBLICATION supabase_realtime ADD TABLE public."Orders";

-- 7. Crează index pentru performanță
CREATE INDEX IF NOT EXISTS idx_orders_week_number ON public."Orders"(week_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public."Orders"(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public."Orders"(created_at DESC);

-- 7. Inserează date de test (opțional)
/*
INSERT INTO public."Orders" (
  id, 
  order_number, 
  week_number, 
  location,
  location_latitude,
  location_longitude,
  daily_schedule,
  role_assignments
)
VALUES (
  'order_test_1',
  'ORD-2026-001',
  6,
  'Copenhagen Central Station',
  55.6761,
  12.5683,
  '[
    {"day": "Monday", "enabled": true, "startTime": "06:00", "endTime": "18:00", "cirkl": ""},
    {"day": "Tuesday", "enabled": true, "startTime": "06:00", "endTime": "18:00", "cirkl": ""},
    {"day": "Wednesday", "enabled": true, "startTime": "06:00", "endTime": "18:00", "cirkl": ""},
    {"day": "Thursday", "enabled": true, "startTime": "06:00", "endTime": "18:00", "cirkl": ""},
    {"day": "Friday", "enabled": true, "startTime": "06:00", "endTime": "18:00", "cirkl": ""},
    {"day": "Saturday", "enabled": false, "startTime": "", "endTime": "", "cirkl": ""},
    {"day": "Sunday", "enabled": false, "startTime": "", "endTime": "", "cirkl": ""}
  ]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
*/

-- Verifică configurarea
SELECT tablename, schemaname, rowsecurity
FROM pg_tables 
WHERE tablename = 'Orders';

-- Afișează politicile active
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'Orders';

-- Numără înregistrările
SELECT COUNT(*) as total_orders FROM public."Orders";
