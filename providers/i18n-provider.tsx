"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getCookie } from "cookies-next";

type Messages = Record<string, any>;

interface I18nContextType {
  locale: string;
  messages: Messages;
  t: (key: string) => string;
  changeLocale: (newLocale: string) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("vi");
  const [messages, setMessages] = useState<Messages>({});

  const loadMessages = async (currentLocale: string) => {
    try {
      const mod = await import(`@/messages/${currentLocale}.json`);
      setMessages(mod.default);
    } catch {
      const mod = await import(`@/messages/vi.json`);
      setMessages(mod.default);
    }
  };

  useEffect(() => {
    const cookieLocale = getCookie("locale") as string;
    const currentLocale = cookieLocale || "vi";
    setLocale(currentLocale);
    loadMessages(currentLocale);
  }, []);

  const changeLocale = async (newLocale: string) => {
    setLocale(newLocale);
    await loadMessages(newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ locale, messages, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations(namespace?: string) {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslations must be used within I18nProvider");

  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return context.t(fullKey);
  };
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useLocale must be used within I18nProvider");
  return context.locale;
}

export function useChangeLocale() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useChangeLocale must be used within I18nProvider");
  return context.changeLocale;
}

// Export context for direct use if needed
export { I18nContext };
