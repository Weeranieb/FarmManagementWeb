import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
// import LanguageDetector from 'i18next-browser-languagedetector'
import translationEN from './en/translation.json'
import translationTH from './th/translation.json'

export const resources = {
  en: { translation: translationEN },
  th: { translation: translationTH },
}

const DETECTION_OPTIONS = {
  order: ['localStorage', 'navigator'],
  caches: ['localStorage'],
}

i18next
  //   .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // resources,
    // fallbackLng: "en", // use en if detected lng is not available
    // keySeparator: false, // we do not use keys in form messages.welcome
    // interpolation: { escapeValue: false }, // react already safes from xss

    resources,
    detection: DETECTION_OPTIONS,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18next
