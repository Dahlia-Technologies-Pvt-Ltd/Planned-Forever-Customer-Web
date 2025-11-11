import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    defaultNS: "common",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["localStorage", "cookie", "navigator"],
      caches: ["localStorage", "cookie"],
    },
    react: {
      useSuspense: false, // Disable suspense mode
      wait: true, // Wait for translations before rendering
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
    // Language direction config
    languages: {
      en: { dir: "ltr" },
      ar: { dir: "rtl" },
      hi: { dir: "ltr" },
    },
  });

// Handle loading errors
i18n.on("failedLoading", (lng, ns, msg) => {
  console.error(`i18n loading failed: ${lng} ${ns} ${msg}`);
});

// Direction change handler
i18n.on("languageChanged", (lng) => {
  const direction = i18n.languages[lng]?.dir || "ltr";
  document.documentElement.dir = direction;
  document.documentElement.lang = lng;
  document.documentElement.setAttribute("lang", lng);
});

export default i18n;
