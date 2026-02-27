"use client";

import { createContext, useContext, useState, useEffect } from "react";

import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

type Messages = Record<string, any>;

interface I18nContextType {
  locale: string;
  messages: Messages;
  t: (key: string) => string;
  changeLocale: (newLocale: string) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messagesMap: Record<string, Messages> = {
  vi: viMessages,
  en: enMessages,
};



interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale: string;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  // Use server-provided locale for hydration safety
  const [locale, setLocale] = useState(initialLocale);
  const [messages, setMessages] = useState<Messages>(messagesMap[initialLocale] || viMessages);

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    setMessages(messagesMap[newLocale] || viMessages);
    // Note: Cookie setting is handled in LanguageSwitcher or via explicit call
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