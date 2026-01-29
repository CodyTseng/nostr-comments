import { createContext, useContext, type ReactNode } from "react";
import type { Translations } from "../types";
import { en } from "./locales/en";
import { zhCN } from "./locales/zh-CN";
import { zhTW } from "./locales/zh-TW";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { pt } from "./locales/pt";
import { ru } from "./locales/ru";
import { ar } from "./locales/ar";
import { it } from "./locales/it";
import { nl } from "./locales/nl";
import { pl } from "./locales/pl";
import { tr } from "./locales/tr";
import { vi } from "./locales/vi";
import { th } from "./locales/th";
import { id } from "./locales/id";
import { hi } from "./locales/hi";
import { uk } from "./locales/uk";

const locales: Record<string, Translations> = {
  // English
  en,
  "en-US": en,
  "en-GB": en,
  "en-AU": en,
  "en-CA": en,
  // Chinese
  "zh-CN": zhCN,
  "zh-Hans": zhCN,
  "zh-TW": zhTW,
  "zh-Hant": zhTW,
  "zh-HK": zhTW,
  zh: zhCN,
  // Japanese
  ja,
  "ja-JP": ja,
  // Korean
  ko,
  "ko-KR": ko,
  // Spanish
  es,
  "es-ES": es,
  "es-MX": es,
  "es-AR": es,
  "es-CO": es,
  "es-CL": es,
  // French
  fr,
  "fr-FR": fr,
  "fr-CA": fr,
  "fr-BE": fr,
  "fr-CH": fr,
  // German
  de,
  "de-DE": de,
  "de-AT": de,
  "de-CH": de,
  // Portuguese
  pt,
  "pt-BR": pt,
  "pt-PT": pt,
  // Russian
  ru,
  "ru-RU": ru,
  // Arabic
  ar,
  "ar-SA": ar,
  "ar-EG": ar,
  "ar-AE": ar,
  // Italian
  it,
  "it-IT": it,
  // Dutch
  nl,
  "nl-NL": nl,
  "nl-BE": nl,
  // Polish
  pl,
  "pl-PL": pl,
  // Turkish
  tr,
  "tr-TR": tr,
  // Vietnamese
  vi,
  "vi-VN": vi,
  // Thai
  th,
  "th-TH": th,
  // Indonesian
  id,
  "id-ID": id,
  // Hindi
  hi,
  "hi-IN": hi,
  // Ukrainian
  uk,
  "uk-UA": uk,
};

function detectLocale(): string {
  if (typeof navigator === "undefined") return "en";

  const languages = navigator.languages || [navigator.language];

  for (const lang of languages) {
    if (locales[lang]) return lang;
    const short = lang.split("-")[0];
    if (locales[short]) return short;
  }

  return "en";
}

function getTranslations(
  locale?: string,
  customTranslations?: Partial<Translations>,
): Translations {
  const detectedLocale = locale || detectLocale();
  const baseTranslations = locales[detectedLocale] || locales.en;

  if (customTranslations) {
    return { ...baseTranslations, ...customTranslations };
  }

  return baseTranslations;
}

interface I18nContextValue {
  locale: string;
  translations: Translations;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale?: string;
  translations?: Partial<Translations>;
  children: ReactNode;
}

export function I18nProvider({
  locale,
  translations: customTranslations,
  children,
}: I18nProviderProps) {
  const resolvedLocale = locale || detectLocale();
  const translations = getTranslations(resolvedLocale, customTranslations);

  const t = (key: keyof Translations): string => {
    return translations[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale: resolvedLocale, translations, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback when not wrapped in provider
    const translations = getTranslations();
    return {
      locale: "en",
      translations,
      t: (key) => translations[key] || key,
    };
  }
  return context;
}

export {
  en,
  zhCN as zhCN,
  zhTW,
  ja,
  ko,
  es,
  fr,
  de,
  pt,
  ru,
  ar,
  it,
  nl,
  pl,
  tr,
  vi,
  th,
  id,
  hi,
  uk,
};
