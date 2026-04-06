"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getUserPreferences } from "@/lib/api";
import {
  APP_LOCALE_STORAGE_KEY,
  FALLBACK_LOCALE,
  getMessage,
  normalizeLocale,
  type AppLocale,
  type MessageKey,
} from "@/lib/i18n/messages";
import { useAuth } from "./AuthContext";

interface LocaleContextType {
  locale: AppLocale;
  setLocale: (nextLocale: AppLocale) => void;
  refreshLocaleFromPreferences: () => Promise<void>;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);
const LOCALE_CHANGE_EVENT = "app-locale-change";

function persistLocale(nextLocale: AppLocale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, nextLocale);
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
}

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") {
    return FALLBACK_LOCALE;
  }
  return normalizeLocale(window.localStorage.getItem(APP_LOCALE_STORAGE_KEY));
}

function subscribeToLocaleChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === APP_LOCALE_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleLocaleChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);
  };
}

function getLocaleSnapshot(): AppLocale {
  return readStoredLocale();
}

function getLocaleServerSnapshot(): AppLocale {
  return FALLBACK_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const locale = useSyncExternalStore(
    subscribeToLocaleChanges,
    getLocaleSnapshot,
    getLocaleServerSnapshot
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    persistLocale(nextLocale);
  }, []);

  const refreshLocaleFromPreferences = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const preferences = await getUserPreferences();
      const normalizedLocale = normalizeLocale(preferences.language);
      setLocale(normalizedLocale);
    } catch {
      return;
    }
  }, [setLocale, user]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      return;
    }

    void refreshLocaleFromPreferences();
  }, [loading, refreshLocaleFromPreferences, user]);

  const value = useMemo<LocaleContextType>(
    () => ({
      locale,
      setLocale,
      refreshLocaleFromPreferences,
      t: (key: MessageKey) => getMessage(locale, key),
    }),
    [locale, refreshLocaleFromPreferences, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
