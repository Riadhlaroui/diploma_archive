"use client";
import "@/lib/i18n"; // ✅ Forces i18n to initialize
import { useTranslation } from "react-i18next";

import React, { useEffect } from "react";

const SettingsPage = () => {
  const { t, i18n } = useTranslation();

  const switchLanguage = (lang: "en" | "fr") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as "en" | "fr" | null;
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 p-4">
      <span className="text-xl font-bold">{t("settings.title")}</span>

      <div className="flex justify-center items-center">
        <label htmlFor="language-select" className="mr-2 font-semibold">
          {t("language")}
        </label>
        <select
          id="language-select"
          className="border rounded-md px-2 py-1 dark:bg-[#1f1f1f] dark:text-white"
          value={i18n.language}
          onChange={(e) => switchLanguage(e.target.value as "en" | "fr")}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

    </div>
  );
};

export default SettingsPage;
