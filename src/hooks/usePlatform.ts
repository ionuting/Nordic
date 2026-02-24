import { Capacitor } from '@capacitor/core';

export const usePlatform = () => {
  const isMobile = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === 'android';
  const isIOS = Capacitor.getPlatform() === 'ios';

  return { isMobile, isAndroid, isIOS };
};
