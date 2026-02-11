-- SQL Script pentru adăugare coloane săptămânale în tabelul Qualifications
-- Fiecare membru va avea câte o coloană pentru fiecare săptămână (1-52)
-- Valoarea va fi order_number-ul asignat pentru acea săptămână

-- Adaugă coloane pentru toate cele 52 de săptămâni
DO $$
BEGIN
  FOR week_num IN 1..52 LOOP
    EXECUTE format('
      ALTER TABLE public."Qualifications"
      ADD COLUMN IF NOT EXISTS week_%s text DEFAULT NULL;
    ', week_num);
  END LOOP;
END $$;

-- Crează index pentru căutări rapide după săptămână
CREATE INDEX IF NOT EXISTS idx_qualifications_week_1 ON public."Qualifications"(week_1);
CREATE INDEX IF NOT EXISTS idx_qualifications_week_6 ON public."Qualifications"(week_6);
CREATE INDEX IF NOT EXISTS idx_qualifications_week_12 ON public."Qualifications"(week_12);
CREATE INDEX IF NOT EXISTS idx_qualifications_week_24 ON public."Qualifications"(week_24);
CREATE INDEX IF NOT EXISTS idx_qualifications_week_52 ON public."Qualifications"(week_52);

-- Verifică structura tabelului
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Qualifications' 
AND column_name LIKE 'week_%'
ORDER BY column_name;

COMMENT ON TABLE public."Qualifications" IS 'Team members with weekly order assignments (week_1 to week_52 columns store order_number)';
