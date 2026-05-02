"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale } from "../translations/dictionary";

type LanguageContextType = {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Locale>("kz");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem("language", "kz");
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState("kz");
    localStorage.setItem("language", "kz");
  };

  const t = (key: string): string => {
    const currentLang = "kz";
    let current: any = translations[currentLang];
    return current[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
