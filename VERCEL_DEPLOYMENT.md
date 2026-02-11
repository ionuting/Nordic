# Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. GitHub Setup
```bash
cd typescript-app

# Initialize git (if not already done)
git init

# Add all files except those in .gitignore
git add .
git commit -m "Initial commit: Task Planner application"

# Add remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/task-planner.git
git branch -M main
git push -u origin main
```

### 2. Environment Variables Setup

**IMPORTANT: Never commit `.env` file to GitHub!**

Your `.env` file should be in `.gitignore` (already configured).

Create `.env.local` for local development:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)

---

## 🚀 Deploy on Vercel

### Step 1: Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repo: `task-planner`
5. Click **"Import"**

### Step 2: Configure Build Settings
Vercel should auto-detect:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

If not auto-detected, set them manually.

### Step 3: Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |

**Important**: These must be set for ALL environments (Production, Preview, Development).

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (usually 2-3 minutes)
3. Your app will be at: `https://project-name.vercel.app`

---

## 🐛 Troubleshooting Build Errors

### Error: "Command 'npm run build' exited with 1"

**Possible Causes:**

#### 1. Missing Environment Variables
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
- They must be in **ALL** environments

**Fix:**
```bash
# Verify locally first
npm run build
```

#### 2. TypeScript Errors
Check for type errors:
```bash
npx tsc --noEmit
```

Fix any errors before pushing to GitHub.

#### 3. Dependency Issues
Clear everything and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 4. ESLint Warnings
If ESLint is too strict, we use `tsc --noEmit` instead of full `tsc`.

Verify build works locally:
```bash
npm run build
```

### Error: "Cannot find module '@supabase/supabase-js'"

Install dependencies:
```bash
npm install
```

Make sure `node_modules` exists locally before viewing the error in Vercel.

---

## ✅ Verify Deployment

After successful deploy:

1. Visit your Vercel URL
2. Check Supabase connection in browser console
3. Try to load data (should appear on map)

---

## 📝 Post-Deployment

### Setup Supabase RLS (Row Level Security)

To ensure your Anon Key is secure, configure RLS policies in Supabase:

```sql
-- Example: Users can only read public orders
CREATE POLICY "Allow public orders read"
  ON orders FOR SELECT 
  USING (true);

-- Admins only can update
CREATE POLICY "Allow admin update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');
```

---

## 🔄 Continuous Deployment

Once connected:
- Every `git push` to `main` triggers automatic build on Vercel
- Failed builds won't deploy
- Preview URLs for pull requests

---

## 🔒 Security Notes

- ✅ `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are **safe on frontend**
- ✅ They have read-only permissions via Supabase RLS
- ✅ Never use Secret Key on frontend
- ✅ `.env` is in `.gitignore` - won't be committed

---

## Need Help?

- [Vercel Docs](https://vercel.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev/)
