import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUser } from "../lib/utils";
import {
  DEFAULT_LANGUAGE,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
} from "./translations";

const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  supportedLanguages: SUPPORTED_LANGUAGES,
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

const getUserSettingsKey = (currentUser) => {
  const keyPart = currentUser?.id || currentUser?._id || currentUser?.email;
  return keyPart ? `userSettings:${keyPart}` : "userSettings:anonymous";
};

const readLanguagePreference = () => {
  try {
    const user = getUser();
    const key = getUserSettingsKey(user);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const fromSettings = parsed?.preferences?.language;
      if (fromSettings) return normalizeLanguage(fromSettings);
    }
  } catch (e) {
    // ignore
  }

  try {
    const raw = localStorage.getItem("app.language");
    if (raw) return normalizeLanguage(raw);
  } catch (e) {
    // ignore
  }

  return DEFAULT_LANGUAGE;
};

const writeLanguagePreference = (nextLanguage) => {
  try {
    localStorage.setItem("app.language", nextLanguage);
  } catch (e) {
    // ignore
  }

  // Also mirror into per-user Settings if present, so the selector stays in sync.
  try {
    const user = getUser();
    const key = getUserSettingsKey(user);
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const merged = {
      ...(parsed || {}),
      preferences: {
        ...(parsed?.preferences || {}),
        language: nextLanguage,
      },
    };
    localStorage.setItem(key, JSON.stringify(merged));
  } catch (e) {
    // ignore
  }

  // Same-tab broadcast
  window.dispatchEvent(new Event("userSettingsChange"));
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => readLanguagePreference());

  const setLanguage = useCallback((next) => {
    const normalized = normalizeLanguage(next);
    setLanguageState(normalized);
    writeLanguagePreference(normalized);
  }, []);

  useEffect(() => {
    // Apply html lang for accessibility
    try {
      document.documentElement.lang = language;
    } catch (e) {
      // ignore
    }
  }, [language]);

  useEffect(() => {
    const syncFromStorage = () => setLanguageState(readLanguagePreference());
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("userSettingsChange", syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("userSettingsChange", syncFromStorage);
    };
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const lang = normalizeLanguage(language);
      const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE] || {};
      if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
      const enDict = TRANSLATIONS[DEFAULT_LANGUAGE] || {};
      if (Object.prototype.hasOwnProperty.call(enDict, key)) return enDict[key];
      return fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      supportedLanguages: SUPPORTED_LANGUAGES,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = React.useContext(I18nContext);
  return ctx;
};
