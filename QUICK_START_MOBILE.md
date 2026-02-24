# 🚀 Quick Start - Capacitor Mobile Development

## TL;DR - Rapid Setup

```bash
# 1. Build & Sync cu Android
npm run build:mobile

# 2. Deschide Android Studio
npx cap open android

# 3. Apasă Run button în Android Studio
# ✅ App va fi instalat pe emulator/device
```

---

## ⚡ Pre-requirements (Once)

1. **Descarcă Android Studio:**
   - https://developer.android.com/studio
   - Instalează Android SDK 31+
   - Instalează emulator (optional)

2. **Verifică Java:**
   ```bash
   java -version   # Trebuie 11+
   ```

3. **Verifică ADB (pentru device real):**
   ```bash
   adb devices     # lista devices conectate
   ```

---

## 📱 Development Workflow

### **Web Development (Normal)**
```bash
npm run dev
# Rulează pe http://localhost:5173
```

### **Android Development**
```bash
# Opțiunea 1: Build + Open Android Studio
npm run mobile:build

# Opțiunea 2: Doar build
npm run build:mobile

# Opțiunea 3: Manual
npx cap open android
```

### **Emulator Setup (First Time)**
1. Android Studio → Tools → Device Manager
2. Create Device → Select phone model → Download system image
3. Launch device
4. Rulează `npm run mobile:build` și apasă Run

### **Real Device Setup (First Time)**
1. Conectează phone cu USB
2. Settings → Developer options → USB Debugging → ON
3. Trust computer certificat pe device
4. Rulează `npm run mobile:build` și selectează device în Android Studio

---

## 🔄 Typical Day

```bash
# Editezi cod React --> Ca de obicei
# Vrei să testezi pe Android:

npm run build:mobile    # Build & sync

# Android Studio se deschide automat (dacă ai mobile:build)
# NOULA: Apasă Run button și gata!
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| **App crashes on launch** | Check Logcat (View → Tool Windows → Logcat) |
| **Emulator nu pornește** | Android Studio → Device Manager → Launch |
| **"SDK not found"** | Android Studio → Settings → SDK Manager → install Android 31+ |
| **Device nu e detectat** | `adb devices` checker; enable USB Debugging on phone |
| **Connection to Supabase fails** | Check internet on device; Emulator needs special IP: `10.0.2.2` |

---

## 📦 Production Build (Google Play)

```bash
# Android Studio → Build → Generate Signed Bundle/APK
# Sign & export AAB (for Play Store)
```

---

## 📚 More Info

- **Full Setup Guide:** [MOBILE_SETUP.md](./MOBILE_SETUP.md)
- **Project Status:** [CAPACITOR_STATUS.md](./CAPACITOR_STATUS.md)
- **Capacitor Docs:** https://capacitorjs.com/

---

**Acum ai Android support! 🎉 Acelasi cod React pe web și mobile!**
