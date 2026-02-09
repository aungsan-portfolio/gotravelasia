import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language } from "./translations";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("gotravel-language") as Language | null;
        if (saved && (saved === "en" || saved === "my")) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("gotravel-language", lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || translations["en"][key] || key;
    };

    // Apply font + lang attribute
    useEffect(() => {
        document.documentElement.lang = language === "my" ? "my" : "en";
        if (language === "my") {
            document.documentElement.classList.add("font-myanmar");
            document.documentElement.classList.remove("font-sans");
        } else {
            document.documentElement.classList.add("font-sans");
            document.documentElement.classList.remove("font-myanmar");
        }
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};
