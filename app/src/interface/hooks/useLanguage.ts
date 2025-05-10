// interface/hooks/useLanguage.ts
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
	const { i18n } = useTranslation();

	useEffect(() => {
		const savedLang = localStorage.getItem("lang") as "en" | "fr" | null;
		if (savedLang && savedLang !== i18n.language) {
			i18n.changeLanguage(savedLang);
		}
	}, [i18n]);

	const switchLanguage = (lang: "en" | "fr") => {
		i18n.changeLanguage(lang);
		localStorage.setItem("lang", lang);
	};

	return { switchLanguage };
};
