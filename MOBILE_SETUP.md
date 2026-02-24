# Setup Capacitor Mobile Development

Aplicația Nordic a fost extinsă cu **Capacitor** pentru suport mobile (Android și iOS). Acum poți distribui aceeași aplicație pe web, Android și iOS.

## 📱 Ce este Capacitor?

Capacitor permite transformarea aplicației React existente în app nativ mobile **fără rescrierea codului**. 
- Same codebase pentru web și mobile
- Acces la funcții native (GPS, cameră, notifikări, etc.)
- Build-uri separate pentru fiecare platformă

## 🚀 Setup Inicial

### Cerințe:
1. **Java Development Kit (JDK)** - versiunea 11+
   ```bash
   # Verifică dacă ai Java instalat
   java -version
   ```

2. **Android SDK** - instalat prin Android Studio
   - Descarcă [Android Studio](https://developer.android.com/studio)
   - În Android Studio → Settings → SDK Manager → instalează:
     - Android SDK 31+
     - Android Build Tools 33+
     - Android Emulator

3. **Node.js** - deja ai (^16)

---

## 📋 Workflow-ul de Dezvoltare

### 1. **Development Web (Normal)**
```bash
npm run dev
```
- Rulează aplicația în browser normal (cum ai făcut-o și până acum)
- Hot reload și debugging normal

### 2. **Build pentru Mobile**
```bash
npm run build:mobile
```
- Construiește app-ul React (`npm run build`)
- Sincronizează assets cu Android folder (`npx cap sync`)
- Gata pentru deschidere în Android Studio

### 3. **Deschide Android Studio**
```bash
npm run mobile:open
```
SAU manual:
```bash
npx cap open android
```

Asta va deschide `android/` folder în Android Studio.

---

## 🔨 Development cu Android Emulator

### A. Rulează emulator-ul
```bash
# În Android Studio: Tools → Device Manager → Create Device → Launch
# NOULA: Emulator-ul va fi automat disponibil
```

### B. Build pe emulator
```bash
# În Android Studio:
# 1. Selectează emulator-ul din Device Manager
# 2. Click butonul "Run" (play icon)
# NOULA: Aplicația va fi instalată și lansată pe emulator
```

### C. Debugging în Android Studio
- Logcat: View → Tool Windows → Logcat
- Breakpoints: Click pe linia de cod din Java
- DevTools: Apasă `Ctrl + Shift + I` pe emulator (dacă Capacitor DevTools e activ)

---

## 📱 Development pe Device Real (Android)

### 1. Enable Developer Mode pe telefon
- Settings → About → Build Number (apasă de 7 ori)
- Vei vedea "Developer options"

### 2. Enable USB Debugging
- Settings → Developer options → USB Debugging → ON

### 3. Conectează telefonul la PC
```bash
# Verifică dacă telefonul e detectat
adb devices

# Output ar trebui să arate ceva ca:
# List of attached devices
# XXXXXXX        device
```

### 4. Build și deploy pe device
```bash
# În Android Studio, selectează telefonul din dropdown
# Click Run button
```

---

## 🔄 Workflow Zilnic

**Când editezi cod React:**
```bash
1. npm run build:mobile    # Rebuild și sync cu Android
2. npx cap open android    # Deschide Android Studio
3. Apasă Run în Android Studio
```

**Quick restart pe Android:**
- Android Studio: Build → Clean Project
- Run din nou

**Debugging:**
```bash
# Terminal 1: Rulează web dev
npm run dev

# Terminal 2: Ascultă logs din device/emulator
adb logcat
```

---

## 🌐 Networking (Conectare la Supabase/Backend)

### Local Development
- Web (browser): `http://localhost:5173` ✅
- Emulator: Trebuie `http://10.0.2.2:5173` (nu `localhost`)
- Device real: Trebuie IP-ul PC-ului `http://192.168.X.X:5173`

### Supabase
- URL-ul public e deja configurat în `.env`
- Ar trebui să funcționeze automat pe mobile

---

## 📦 Build Production (APK/AAB pentru Google Play)

### A. Generare APK (pentru testing)
```bash
# Android Studio:
# 1. Build → Generate Signed Bundle/APK
# 2. Selectează APK
# 3. Creează keystore (dacă nu ai)
# 4. Sign și exportă
```

### B. Generare AAB (pentru Google Play)
```bash
# Android Studio:
# 1. Build → Generate Signed Bundle/APK
# 2. Selectează Bundle
# 3. Sign și exportă
# 4. Upload pe Google Play Console
```

---

## 🔐 Securitate & Permissions

Capacitor cere permisiuni automat pe Android 6+. Trebuie declarat:

### AndroidManifest.xml
Deja configurat în `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Exemple de permissions (deja incluse) -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
```

### Adăugare Permission Nouă
Editează `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.YOUR_PERMISSION" />
```

---

## 🐛 Troubleshooting

### Emulator nu pornește
```bash
# Șterge emulator-ul și recreează
adb delete-device emulator-5554
# Sau în Android Studio: Device Manager → Delete
```

### Build fails cu "SDK not found"
```bash
# Asigură-te că AI Android SDK instalat
# Android Studio → Settings → SDK Manager → instalează Android 31+
```

### App blocheaza/crash pe mobile
```bash
# Vezi logs
adb logcat | grep Nordic

# Sau în Android Studio: Logcat tab
```

### Supabase Connection fails pe mobile
```bash
# Asigură-te că ai internet pe device/emulator
# Emulator: Settings → Wi-Fi → conectează-te
# Device: Conectează-te la phone data sau Wi-Fi
```

---

## 📚 Resurse

- [Capacitor Docs](https://capacitorjs.com/docs/)
- [Android Development Setup](https://capacitorjs.com/docs/android/environment-setup)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins) - GPS, cameră, notifikări, etc.

---

## ✅ Quick Reference

```bash
# Development
npm run dev                    # Web dev mode

# Mobile Build
npm run build:mobile           # Build + sync with Android
npm run mobile:open            # Deschide Android Studio
npm run mobile:build           # Build + open Android Studio mai direct

# Android CLI
npx cap add android            # Adauga Android platform (deja făcut)
npx cap sync                   # Sincronizează cu Android
npx cap open android           # Deschide Android Studio
```

---

**Bravo! Acum ai o aplicație care rulează pe web, Android, și ușor poți adapta pentru iOS pe viitor! 🎉**
