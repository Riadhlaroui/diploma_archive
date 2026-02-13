"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../i18n/locales/en/translation.json";
import fr from "../i18n/locales/fr/translation.json";
import ar from "../i18n/locales/ar/translation.json";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: "ar",
		interpolation: { escapeValue: false },
		resources: {
			en: { translation: en },
			fr: { translation: fr },
			ar: { translation: ar },
		},
	});

export default i18n;
