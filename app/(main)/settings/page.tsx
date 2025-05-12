"use client";
import "@/lib/i18n"; // ✅ Forces i18n to initialize
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const SettingsPage = () => {
	const { t, i18n } = useTranslation();

	const switchLanguage = (lang: "en" | "fr" | "ar") => {
		i18n.changeLanguage(lang);
		localStorage.setItem("lang", lang);
		// 🔥 DO NOT change document direction here
	};

	useEffect(() => {
		const savedLang = localStorage.getItem("lang") as "en" | "fr" | "ar" | null;
		const langToUse = savedLang || i18n.language;

		i18n.changeLanguage(langToUse);
		// 🔥 DO NOT update document.documentElement.dir here
	}, [i18n]);

	return (
		<div className="w-full flex flex-col gap-4 p-4">
			<span className="text-xl text-start font-semibold">
				{t("settings.title")}
			</span>

			<div className="flex items-center gap-2">
				<label htmlFor="language-select" className="font-semibold text-lg">
					{t("language")}
				</label>
				<Select
					value={i18n.language}
					onValueChange={(value: "en" | "fr" | "ar") => switchLanguage(value)}
				>
					<SelectTrigger className="w-[150px] h-fit dark:bg-[#1f1f1f] dark:text-white">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en">English</SelectItem>
						<SelectItem value="fr">Français</SelectItem>
						<SelectItem value="ar">العربية</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default SettingsPage;
