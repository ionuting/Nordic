# Task Planner TypeScript Application

O aplicație TypeScript/React care se conectează la Supabase pentru managementul membrilor de echipă **și planificarea orders săptămânale**, replicând funcționalitățile din aplicația Godot TaskPlanner.

## Caracteristici

- ✅ **Integrare Supabase** - Citește membri și orders din baza de date
- ✅ **Management membri de echipă** - Afișare, filtrare și organizare membri
- ✅ **Order Management** - Creare, editare și ștergere orders săptămânale
- ✅ **13 Role Assignments** - Drag & drop membri în 13 role specifice (exact ca în Godot)
- ✅ **Daily Schedule** - Program zilnic (Luni-Duminică) cu timp start/end
- ✅ **Filtrare avansată** - După nume și calificări (SR1, SR2, ORF, MF, TS, PS, ST, HM)
- ✅ **Drag & Drop** - Trage membri în orders pentru asignare
- ✅ **Auto-hide assigned members** - Membrii asignați dispar din sidebar automat
- ✅ **Week-based assignment tracking** - Sistem cu 52 săptămâni pentru tracking disponibilitate membri
- ✅ **Interactive Map Picker** - Selectare locație pe hartă cu coordonate GPS (Leaflet)
- ✅ **Real-time updates** - Sincronizare automată cu Supabase
- ✅ **Nordic Maskin Branding** - Design cu culoarea oficială (#125c5c)
- ✅ **UI modern** - Design responsive cu React și CSS

## Structura Bazei de Date

### Tabelul `Qualifications` (Team Members)

```sql
CREATE TABLE public."Qualifications" (
  internal_number bigint PRIMARY KEY,
  name text,
  phone text,
  sr1 boolean,
  sr2 boolean,
  orf boolean,
  mf boolean,
  ts boolean,
  ps boolean,
  st boolean,
  hm boolean
);
```

### Tabelul `Orders` (Weekly Tasks)

```sql
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
```

**Important:** Orders conțin 13 role slots pentru asignarea membrilor echipei (exact ca în Godot WeeklyTaskNode).

## Instalare și Configurare

#### A. Pentru tabelul Qualifications

Trebuie să configurezi Row Level Security (RLS) pentru tabelul Qualifications:

```sql
-- Activează RLS
ALTER TABLE public."Qualifications" ENABLE ROW LEVEL SECURITY;

-- Permite citirea tuturor datelor (pentru aplicație)
CREATE POLICY "Enable read access for all users" ON public."Qualifications"
  FOR SELECT
  USING (true);
```

#### B. Pentru tabelul Orders (NEW!)

**Rulează scriptul SQL complet:**

```powershell
# În Supabase Dashboard → SQL Editor
# Deschide și rulează fișierul: supabase_orders_setup.sql
```

Sau vezi: [supabase_orders_setup.sql](supabase_orders_setup.sql)Activează RLS
ALTER TABLE public."Qualifications" ENABLE ROW LEVEL SECURITY;

-- Permite citirea tuturor datelor (pentru aplicație)
CREATE POLICY "Enable read access for all users" ON public."Qualifications"
  FOR SELECT
  USING (true);

-- Opțional: Permite inserare/modificare (dacă vrei funcționalități CRUD complete)
CREATE POLICY "Enable insert for authenticated users" ON public."Qualifications"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public."Qualifications"
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public."Qualifications"
  FOR DELETE
  USING (true);
```

### 4. Pornire aplicație

```powershell
npm run dev
```

Aplicația va rula pe `http://localhost:3000`

## Structura Proiectului

```
typescript-app/
├── src/
│   ├── components/
│   │   ├── TeamMemberCard.tsx       # Card pentru afișare membru
│   │   ├── TeamMemberCard.css
│   │   ├── TeamLibrarySidebar.tsx   # Sidebar cu librăria de membri
│   │   ├── TeamLibrarySidebar.css
│   │   ├── OrderNode.tsx            # Order card cu 13 role slots
│   │   ├── OrderNode.css
│   │   ├── MapPicker.tsx            # Interactive map pentru selectare locație
│   │   └── MapPicker.css
│   ├── services/
│   │   ├── supabaseService.ts       # Servicii pentru team members
│   │   └── orderService.ts          # Servicii pentru orders
│   ├── types/
│   │   ├── teamMember.ts            # Tipuri TypeScript pentru membri
│   │   └── order.ts                 # Tipuri pentru orders și role
│   ├── App.tsx                      # Componenta principală
│   ├── App.css
│   ├── theme.css                    # CSS variables pentru Nordic Maskin colors
│   ├── main.tsx                     # Entry point
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── supabase_setup.sql               # Setup pentru Qualifications
├── supabase_orders_setup.sql        # Setup pentru Orders
├── supabase_add_week_columns.sql    # Adaugă 52 coloane week_X (NEW!)
├── README.md
├── SETUP_INSTRUCTIONS.md
└── ORDER_SYSTEM_GUIDE.md            # Ghid complet pentru orders
```

## Componente Principale

### TeamLibrarySidebar
- Afișează toți membrii din baza de date
- **Exclude automat** membrii deja asignați la orders
- Filtrare după num (Orders)
- Afișare listă de orders
- Buton "Add New Order" pentru creare rapidă
- Drag & drop members în role slots
- Auto-sync cu Supabase

## API Services

### TeamMemberletă** a Godot WeeklyTaskNode
- **13 role slots** pentru asignarea membrilor:
  1. Sjakbajs
  2. SR/ORS/ORF
  3-4. Thermitsvejser (2 posturi)
  5. Pålægssvejser
  6. Sporteknikker
  7. Sidemandsoplærer
  8-10. Håndmand (3 posturi)
  11. Chauffør/Maskinfører
  12. Køretøjstype ID
  13. Banevogn/Redskab ID
- Week number și order number
- Daily schedule (7 zile cu time ranges)
- Locație cu GPS coordinates
- Drag & drop support pentru fiecare role

### TeamMemberCard
- Afișează informații despre un membru (nume, telefon, calificări)
- Drag & Drop support
- Status visual (disponibil/indisponibil)

### MapPicker
- **Hartă interactivă** folosind Leaflet și OpenStreetMap
- Click pe hartă pentru selectare locație
- **Reverse geocoding** - Afișează adresa din coordonate GPS
- Coordonate live în format lat, lng (6 decimale)
- Modal overlay cu design Nordic Maskin
- Salvare automată în Orders table (location_latitude, location_longitude)
- Marker vizual pentru locația selectată

### Planning Canvas
- # OrderService (NEW!)

```typescript
// CRUD operations pentru orders
OrderService.getAllOrders()
OrderService.getOrderById(orderId)
OrderService.getOrdersByWeek(weekNumber)
OrderService.createOrder(order)
OrderService.updateOrder(orderId, updates)
OrderService.deleteOrder(orderId)

// Real-time subscriptions
OrderService.subscribeToChanges(onInsert, onUpdate, onDelete)
```
5. **Orders**: Structură identică cu 13 role slots (exact ca WeeklyTaskNode)
6. **Auto-hide members**: Membrii asignați dispar automat din sidebar

## Funcționalități implementate

- ✅ **Team Members Management** - CRUD complet pentru membri
- ✅ **Orders Management** - CRUD complet pentru orders
- ✅ **13 Role Assignments** - Exact ca în Godot WeeklyTaskNode
- ✅ **Daily Schedule** - 7 zile cu enable/disable și time ranges
- ✅ **Drag & Drop** - Asignare membri la role
- ✅ **Auto-hide assigned members** - Filtrare automată în sidebar
- ✅ **Real-time sync** - Supabase Realtime pentru toate tabelele
- ✅ **Week-based planning** - Current week detection

## Funcționalități viitoare

- [ ] Week selector (navigare între săptămâni)
- [ ] Copy order to next week
- [ ] Timeline/Calendar view
- [ ] Export rapoarte în CSV/PDF
- [ ] Notificări real-time
- [ ] Autentificare utilizatori
- [ ] Member availability calendar
- [ ] Order templates
- [ ] Multi-user collaboration indicators

## Documentație Completă

📖 **Ghiduri disponibile:**
- [README.md](README.md) (acest fișier) - Prezentare generală
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Pași detaliat de instalare
- [ORDER_SYSTEM_GUIDE.md](ORDER_SYSTEM_GUIDE.md) - Ghid complet pentru orders
- [COMPARISON.md](COMPARISON.md) - Comparație Godot vs TypeScriptsăptămâna curentă

2. **Configurează Detalii Order**
   - Introdu Order Number (ex: "ORD-2026-001")
   - Setează Location
   - ConfigureazăDaily Schedule (check zilele, setează ore)

3. **Asignează Membri la Role**
   - **Drag** un membru din sidebar
   - **Drop** în unul din cele 13 role slots
   - Membrul **dispare automat** din sidebar
   - Asignarea se salvează în Supabase

4. **Gestionare Membri Asignați**
   - Cliers nu apar

1. Verifică că tabelul are date (rulează scriptul `supabase.py`)
2. Verifică consola browser pentru erori
3. Testează conexiunea în Supabase Dashboard

### Orders nu se salvează

1. Rulează `supabase_orders_setup.sql` în Supabase SQL Editor
2. Verifică că RLS policies sunt activate
3. Verifică Realtime în Table Editor

### Drag & Drop nu funcționează

1. Asigură-te că tragi din sidebar (nu din orders)
2. Drop în unul din cele 13 role slots (dreptunghiuri colorate)
3. Verifică console pentru erori

### Membru nu dispare după asignare

1. Verifică `role_assignments` în Supabase Table Editor
2. Refresh pagina (F5)
3. Verifică că real-time subscription e activăTEM_GUIDE.md](ORDER_SYSTEM_GUIDE.md)

##Zonă pentru planificare taskuri
- Primește membri prin drag & drop
- Afișare membri selectați pentru planificare

## API Supabase Service

Serviciul `TeamMemberService` oferă următoarele metode:

```typescript
// Obține toți membrii
TeamMemberService.getAllMembers()

// Obține un membru după ID
TeamMemberService.getMemberById(internalNumber)

// Filtrare după nume
TeamMemberService.filterMembersByName(nameQuery)

// Filtrare după calificare
TeamMemberService.filterMembersByQualification('sr1')

// CRUD operations
TeamMemberService.createMember(memberData)
TeamMemberService.updateMember(internalNumber, updates)
TeamMemberService.deleteMember(internalNumber)

// Real-time subscriptions
TeamMemberService.subscribeToChanges(onInsert, onUpdate, onDelete)
```

## Build pentru producție

```powershell
npm run build
```

Fișierele de producție vor fi generate în directorul `dist/`.

## Diferențe față de aplicația Godot

1. **Backend**: Folosește direct Supabase PostgreSQL în loc de FastAPI
2. **UI Framework**: React în loc de Godot UI
3. **Real-time**: Folosește Supabase Realtime în loc de WebSocket custom
4. **Deployment**: Poate fi deployat ca aplicație web statică

## Funcționalități viitoare

- [ ] Adăugare task-uri și planificare
- [ ] Timeline control pentru săptămâni
- [ ] Export planuri în CSV/PDF
- [ ] Notificări real-time
- [ ] Autentificare utilizatori

## Troubleshooting

### Eroare de conexiune Supabase

Verifică:
1. URL-ul Supabase este corect în `.env`
2. Anon key este valid
3. RLS policies sunt configurate corect
4. Tabelul `Qualifications` există

### Membri nu apar

1. Verifică că tabelul are date (rulează scriptul `supabase.py`)
2. Verifică consola browser pentru erori
3. Testează conexiunea în Supabase Dashboard

## Licență

MIT
