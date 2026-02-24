#!/bin/bash
# Script helper pentru development cu Capacitor pe Android
# Rulează: bash android-dev.sh

set -e  # Exit if any command fails

echo "🚀 Nordic Mobile Development Helper"
echo "===================================="
echo ""
echo "Selectează o opțiune:"
echo "1) Build & Sync cu Android"
echo "2) Deschide Android Studio"
echo "3) Build + Deschide Android Studio"
echo "4) Curăță și rebuild"
echo "5) Rulează Logcat (logs mobile)"
echo "6) Verifica devices conectate"
echo ""
read -p "Introducere opțiune (1-6): " option

case $option in
  1)
    echo "📦 Building web app și sincronizând cu Android..."
    npm run build:mobile
    echo "✅ Gata! Poți deschide Android Studio cu: npx cap open android"
    ;;
  2)
    echo "📱 Deschizând Android Studio..."
    npx cap open android
    ;;
  3)
    echo "📦 Building..."
    npm run build:mobile
    echo "📱 Deschizând Android Studio..."
    npx cap open android
    ;;
  4)
    echo "🧹 Curățând proiectul..."
    rm -rf dist
    rm -rf android/app/build
    echo "📦 Rebuilding..."
    npm run build
    npx cap sync
    echo "✅ Gata! Proiectul e curat și din nou sincronizat."
    ;;
  5)
    echo "📋 Logcat (apasă Ctrl+C pentru a ieși)..."
    adb logcat | grep --color=auto Nordic
    ;;
  6)
    echo "📱 Devices conectate:"
    adb devices
    ;;
  *)
    echo "❌ Opțiune invalidă!"
    ;;
esac
