import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nordic.app',
  appName: 'Nordic',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  // Plugins configuration (opțional)
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  }
};

export default config;
