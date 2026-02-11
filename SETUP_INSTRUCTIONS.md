# Instrucțiuni de Setup pentru Aplicația Task Planner TypeScript

## Pași Rapidi de Pornire

### 1. Instalare Node.js
Asigură-te că ai Node.js instalat (versiunea 18 sau mai nouă).
Verifică cu: `node --version`

### 2. Instalare dependențe
```powershell
cd typescript-app
npm install
```

### 3. Configurare credențiale Supabase

**Important:** Trebuie să obții cheia Supabase anon key!

#### Obținere Supabase Anon Key:
1. Du-te la [Supabase Dashboard](https://app.supabase.com)
2. Selectează proiectul tău (sau conectează-te la proiectul existent)
3. Click pe **Settings** (setări) în sidebar
4. Click pe **API**
5. Copiază valoarea de la **Project API keys** -> **anon public**

#### Configurare .env:
Editează fișierul `.env` și înlocuiește `your-supabase-anon-key-here` cu cheia copiată:

```env
VITE_SUPABASE_URL=https://wdkuceceqafaeljebtta.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (cheia ta reală)
```

### 4. Verificare bază de date

Asigură-te că tabelul `Qualifications` există în Supabase. Dacă nu, rulează scriptul Python:

```powershell
cd ..
python supabase.py
```

### 5. Configurare Row Level Security (RLS)

Trebuie să configurezi politicile de securitate în Supabase:

1. Du-te la Supabase Dashboard
2. Click pe **Table Editor**
3. Selectează tabelul `Qualifications`
4. Click pe **Add RLS policy**
5. Adaugă această politică pentru citire:

```sql
CREATE POLICY "Enable read access for all users" ON public."Qualifications"
  FOR SELECT
  USING (true);
```

SAU rulează acest SQL în **SQL Editor**:

```sql
-- Activează RLS
ALTER TABLE public."Qualifications" ENABLE ROW LEVEL SECURITY;

-- Permite citirea
CREATE POLICY "Enable read access for all users" ON public."Qualifications"
  FOR SELECT
  USING (true);
```

### 6. Pornește aplicația

```powershell
npm run dev
```

Aplicația va fi disponibilă la: **http://localhost:3000**

## Verificare Funcționalitate

După pornire, ar trebui să vezi:
- ✅ Header cu "Task Planner - Team Management"
- ✅ Sidebar cu membri din baza de date
- ✅ Canvas gol în dreapta unde poți trage membri

Dacă nu vezi membri:
1. Verifică consola browser (F12) pentru erori
2. Verifică că scriptul `supabase.py` a fost rulat și a adăugat date
3. Verifică că RLS policies sunt configurate corect

## Comenzi Disponibile

```powershell
npm run dev      # Pornește server de development
npm run build    # Build pentru producție
npm run preview  # Preview build de producție
npm run lint     # Verifică codul pentru erori
```

## Depanare

### Eroare: "Missing Supabase credentials"
- Verifică că fișierul `.env` există și conține valorile corecte
- Repornește serverul dev după modificarea `.env`

### Eroare: "Failed to load team members"
- Verifică conexiunea la internet
- Verifică că URL-ul Supabase este corect
- Verifică RLS policies în Supabase Dashboard

### Membri nu apar
- Rulează `python supabase.py` pentru a adăuga date test
- Verifică în Supabase Dashboard -> Table Editor că există date în tabelul `Qualifications`

## Contact Support

Pentru probleme, verifică:
1. README.md pentru documentație completă
2. Console browser pentru erori detaliate
3. Supabase Dashboard -> Logs pentru erori backend
