import { useEffect, useMemo, useState } from 'react';
import type { ThemeMode } from '../types';

type WebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type LocationData = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  horizontal_accuracy?: number | null;
};

type TelegramWebApp = {
  colorScheme?: ThemeMode;
  initDataUnsafe?: {
    user?: WebAppUser;
  };
  ready: () => void;
  expand: () => void;
  enableClosingConfirmation?: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  sendData?: (data: string) => void;
  showAlert?: (message: string) => void;
  HapticFeedback?: {
    impactOccurred?: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred?: (type: 'success' | 'error' | 'warning') => void;
  };
  onEvent?: (event: string, cb: () => void) => void;
  offEvent?: (event: string, cb: () => void) => void;
  LocationManager?: {
    init: (callback?: () => void) => void;
    getLocation: (callback: (location: LocationData | null) => void) => void;
    openSettings: () => void;
    isAccessGranted?: boolean;
    isLocationAvailable?: boolean;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export const getTelegram = () => window.Telegram?.WebApp;

export const useTelegram = () => {
  const telegram = useMemo(() => getTelegram(), []);
  const [theme, setTheme] = useState<ThemeMode>(telegram?.colorScheme ?? 'dark');

  useEffect(() => {
    if (!telegram) return;
    telegram.ready();
    telegram.expand();
    telegram.enableClosingConfirmation?.();
    telegram.disableVerticalSwipes?.();
    telegram.setHeaderColor?.('#082317');
    telegram.setBackgroundColor?.('#061810');
    telegram.setBottomBarColor?.('#082317');

    const updateTheme = () => setTheme(telegram.colorScheme ?? 'dark');
    telegram.onEvent?.('themeChanged', updateTheme);
    return () => telegram.offEvent?.('themeChanged', updateTheme);
  }, [telegram]);

  return {
    telegram,
    theme,
    user: telegram?.initDataUnsafe?.user,
    isTelegram: Boolean(telegram),
  };
};

export const requestTelegramLocation = async () =>
  new Promise<LocationData | null>((resolve) => {
    const locationManager = getTelegram()?.LocationManager;
    if (!locationManager) {
      resolve(null);
      return;
    }

    locationManager.init(() => {
      locationManager.getLocation((location) => {
        if (!location && locationManager.isLocationAvailable && !locationManager.isAccessGranted) {
          locationManager.openSettings();
        }
        resolve(location);
      });
    });
  });
