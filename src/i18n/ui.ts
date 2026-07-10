import english from "./lang/en";
import deutsch from "./lang/de";

export const languages = {
  en: 'English',
  de: 'Deutsch',
};

export const defaultLang = 'en';

export const ui = {
  en: english,
  de: deutsch,
} as Record<string, Record<string, string>>;