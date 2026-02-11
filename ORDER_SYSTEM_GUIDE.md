# Order Management System - Setup Guide

## 🎯 Quick Start

### 1. Setup Supabase Tables

**A. Qualifications table (Team Members) - Already configured**

**B. Orders table (NEW)**

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Copy and paste the entire content from supabase_orders_setup.sql file
```

Sau folosește fișierul: [supabase_orders_setup.sql](supabase_orders_setup.sql)

### 2. Configure Environment

Make sure `.env` file has your Supabase credentials:

```env
VITE_SUPABASE_URL=https://wdkuceceqafaeljebtta.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 3. Start Application

```powershell
npm run dev
```

Application will run on: **http://localhost:3000**

---

## 📋 How The Order System Works

### Order Structure (Replicates Godot WeeklyTaskNode)

Each **Order** represents a weekly task and contains:

#### 1. **Basic Information**
- **Week Number** (1-52)
- **Order Number** (editable field like "ORD-2026-001")
- **Location** (text + GPS coordinates)

#### 2. **Daily Schedule** (7 days)
- Monday - Sunday
- Each day has:
  - ☑️ Enable/Disable checkbox
  - ⏰ Start time (e.g., "06:00")
  - ⏰ End time (e.g., "18:00")
  - 🔧 CircWrk field

#### 3. **13 Role Slots** (Team Assignments)

Following the exact Godot structure, you can assign team members to these roles:

| # | Role | Color | Description |
|---|------|-------|-------------|
| 1 | Sjakbajs | Dark Red | Main supervisor |
| 2 | SR/ORS/ORF | Orange | Senior roles |
| 3-4 | Thermitsvejser 1 & 2 | Deep Pink | Welders |
| 5 | Pålægssvejser | Light Blue | Laying welder |
| 6 | Sporteknikker | Yellow | Track technician |
| 7 | Sidemandsoplærer | Light Green | Trainer |
| 8-10 | Håndmand 1, 2, 3 | Cyan | Manual workers |
| 11 | Chauffør/Maskinfører | Purple | Driver/Operator |
| 12 | Køretøjstype ID | Gray | Vehicle type |
| 13 | Banevogn/Redskab ID | Dim Gray | Equipment ID |

---

## 🎨 User Interface Guide

### Left Panel: Team Members Library

**Shows available team members who are NOT yet assigned to any order**

- ✅ Filter by name
- ✅ Filter by qualification (SR1, SR2, ORF, mf, etc.)
- ✅ Real-time updates from Supabase
- 🔄 Refresh button

**Important:** When a member is assigned to an order, they **automatically disappear** from this list!

### Right Panel: Orders Canvas

**Displays all weekly orders**

#### Add New Order
Click **"➕ Add New Order"** button to create a new order for the current week.

#### Order Card Features

1. **Header**
   - 📅 Week number
   - **−** Collapse/Expand
   - **✕** Delete order

2. **Editable Fields**
   - 📋 Order number
   - 📍 Location

3. **Daily Schedule**
   - 7 checkboxes for Mon-Sun
   - Time inputs (enabled only when day is checked)

4. **Role Slots (13 drag zones)**
   - Each slot has a colored border matching the role
   - **Empty state:** "Drop member here"
   - **Filled state:** Member name + ✕ remove button

---

## 🖱️ Drag & Drop Usage

### How to Assign Members to Orders

1. **Find a member** in the left sidebar
2. **Click and drag** the member card
3. **Drop** into one of the 13 role slots in an order
4. ✅ **Member is assigned!**
   - Member disappears from sidebar
   - Member appears in the role slot
   - Changes saved to Supabase automatically

### How to Remove Members from Orders

Click the **✕** button next to the member name in the role slot.

- Member is removed from order
- Member reappears in the sidebar
- Changes saved to Supabase automatically

---

## 🗂️ Data Storage (Supabase)

### Tables

#### `Qualifications` Table
- Stores team members
- Fields: internal_number, name, phone, qualifications (sr1, sr2, etc.)

#### `Orders` Table (NEW)
- Stores weekly orders
- Fields:
  - `id` (text, PK)
  - `order_number` (text)
  - `week_number` (integer)
  - `location` (text)
  - `location_latitude` (double)
  - `location_longitude` (double)
  - `notes` (text)
  - `daily_schedule` (jsonb) - Array of 7 days
  - `role_assignments` (jsonb) - Array of 13 roles
  - `created_at`, `updated_at` (timestamps)

### Real-time Synchronization

Both tables have **real-time subscriptions** enabled:
- ✅ Add new order → All users see it instantly
- ✅ Update order → Changes propagate immediately
- ✅ Delete order → Removed from all screens
- ✅ Member assignments → Live updates

---

## 🎯 Workflow Example

### Planning a Week 6 Order

1. **Create Order**
   - Click "Add New Order"
   - System creates order for current week

2. **Fill Details**
   - Order Number: `ORD-2026-001`
   - Location: `Copenhagen Central Station`

3. **Set Schedule**
   - Check Mon-Fri
   - Times: 06:00 - 18:00

4. **Assign Team**
   - Drag "Ion Popescu" → **Sjakbajs** slot
   - Drag "Maria Ionescu" → **SR/ORS/ORF** slot
   - Drag "Andrei Georgescu" → **Thermitsvejser 1** slot
   - etc.

5. **Done!**
   - All 3 members now hidden from sidebar
   - Order saved to Supabase
   - Ready for next order

---

## 🔧 Troubleshooting

### Members don't appear in sidebar
1. Check Supabase connection (`.env` file)
2. Verify `Qualifications` table has data
3. Run `python supabase.py` to add test data

### Orders don't save
1. Run `supabase_orders_setup.sql` in Supabase
2. Check RLS policies are enabled
3. Verify Realtime is enabled on `Orders` table

### Drag & Drop doesn't work
1. Make sure you're dragging from the sidebar
2. Drop zone must be a role slot rectangle
3. Check browser console for errors

### Member doesn't disappear after assignment
1. Check `role_assignments` in Supabase
2. Refresh page (F5)
3. Check real-time subscription is active

---

## 📦 Project Structure

```
src/
├── components/
│   ├── TeamLibrarySidebar.tsx    # Left panel with members
│   ├── TeamMemberCard.tsx        # Member card
│   ├── OrderNode.tsx             # Order card with 13 slots
│   └── *.css                     # Styles
├── services/
│   ├── supabaseService.ts        # Team members CRUD
│   └── orderService.ts           # Orders CRUD
├── types/
│   ├── teamMember.ts             # Member types
│   └── order.ts                  # Order types (13 roles)
└── App.tsx                       # Main application
```

---

## 🚀 Next Steps

### Future Features to Add

- [ ] Week selector (navigate between weeks)
- [ ] Copy order to next week
- [ ] Export to CSV/PDF
- [ ] Print week plans
- [ ] Member availability calendar
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] Undo/Redo functionality
- [ ] Order templates
- [ ] Multi-user collaboration indicators

---

## 📞 Support

Check these files for more information:
- [README.md](README.md) - Main documentation
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Installation guide
- [COMPARISON.md](COMPARISON.md) - Godot vs TypeScript comparison

For Supabase issues:
- [Supabase Dashboard](https://app.supabase.com)
- Check Logs → check database errors
- Table Editor → verify data structure
