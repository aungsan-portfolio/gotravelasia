import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(HttpBackend)
    .init({
        fallbackLng: "en",
        supportedLngs: ["en", "my"],
        detection: {
            order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
            caches: ["cookie", "localStorage"],
        },
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
