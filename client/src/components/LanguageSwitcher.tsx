import { useTranslation } from "react-i18next";

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center gap-4 text-sm">
            <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 rounded transition ${i18n.language === "en" ? "font-bold text-primary" : "text-muted-foreground"
                    }`}
            >
                English
            </button>
            <span className="text-muted-foreground">|</span>
            <button
                onClick={() => changeLanguage("my")}
                className={`px-3 py-1 rounded transition ${i18n.language === "my" ? "font-bold text-primary" : "text-muted-foreground"
                    }`}
            >
                မြန်မာ
            </button>
        </div>
    );
};
