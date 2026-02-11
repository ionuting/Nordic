# Render Deployment Guide

## ✅ Prerequisites

- Application pushed to GitHub
- Render account (free at [render.com](https://render.com))

---

## 🚀 Deploy to Render (Static Site)

### Step 1: Connect GitHub Repository

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **"New +"** button
3. Select **"Static Site"**
4. Click **"Connect account"** (GitHub authentication)
5. Allow Render to access your GitHub repos
6. Select repository: `task-planner`

### Step 2: Configure Deployment Settings

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `task-planner` (or custom name) |
| **Branch** | `main` |
| **Build Command** | `npm run build` |
| **Publish Directory** | `dist` |

### Step 3: Add Environment Variables

**IMPORTANT**: Render doesn't auto-load .env files (security feature)

Click **"Advanced"** → **"Add Environment Variable"**

Add:
```
VITE_SUPABASE_URL = https://wdkuceceqafaeljebtta.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Deploy

Click **"Create Static Site"**

Wait 2-5 minutes for build to complete.

Your app will be live at: `https://task-planner.onrender.com`

---

## 🔄 Continuous Deployment

Once connected:
- Every push to `main` branch triggers automatic deployment
- Deployment takes ~2-3 minutes
- Failed builds won't replace current production

---

## 🐛 Troubleshooting

### Build Fails

Check build logs in Render Dashboard:

```bash
# If error mentions environment variables:
# → Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

# If error mentions npm:
# → Check that package.json exists in root of typescript-app/

# If error mentions TypeScript:
# → Run locally: npm run build
```

### Blank Page After Deploy

1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - look for failed requests

Common issue: Supabase connection failed
- Verify env variables are set correctly
- Check Supabase project is running

### Site Not Found

- Wait 5 minutes after deploy
- Refresh browser cache (Ctrl+Shift+R)
- Check build logs for errors

---

## 📝 Environment Variables Reference

Required:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon public key

Get these from: [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)

---

## 🔒 Security

- ✅ `VITE_SUPABASE_ANON_KEY` is safe on frontend (limited permissions via RLS)
- ✅ Never expose Secret Role key in environment variables
- ✅ Variables are not visible in public API

---

## 📊 Monitoring

Render Dashboard provides:
- ✅ Build logs
- ✅ Deploy history
- ✅ Custom domain setup
- ✅ SSL certificate (auto-included)

---

## 💡 Pro Tips

1. **Custom Domain**
   - Render Dashboard → Settings → Custom Domain
   - Point your domain DNS to Render

2. **Manual Redeploy**
   - Render Dashboard → Manual Deploy
   - Useful if you just changed env variables

3. **Scale Issues**
   - Static sites are unlimited bandwidth on Render free tier
   - No performance degradation

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Environment variables set (both variables)
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Site deployed and live

---

**Congratulations!** Your app is ready for client presentations! 🎉
