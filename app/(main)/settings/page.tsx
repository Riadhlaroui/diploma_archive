"use client";
import "@/lib/i18n/i18n"; // ✅ Forces i18n to initialize
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
		// The direction change will be handled by the DirectionProvider
	};

	useEffect(() => {
		const savedLang = localStorage.getItem("lang") as "en" | "fr" | "ar" | null;
		const langToUse = savedLang || i18n.language;

		i18n.changeLanguage(langToUse);
	}, [i18n]);

	return (
		<div className="w-full flex flex-col gap-4 p-4">
			<span className="text-2xl text-start font-semibold mt-4">
				{t("settings.title")}
			</span>

			<div className="w-full max-w-[80%] mx-auto px-4 py-6 space-y-6">
				{/* Language Setting */}
				<div className="flex items-center justify-between border-b pb-4">
					<label htmlFor="language-select" className="font-semibold text-lg">
						{t("language")}
					</label>
					<Select
						value={i18n.language?.split("-")[0] || "en"}
						onValueChange={(value: string) =>
							switchLanguage(value as "en" | "fr" | "ar")
						}
					>
						<SelectTrigger className="w-[150px] h-fit dark:bg-[#1f1f1f] dark:text-white">
							<SelectValue placeholder="select language" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="en">English</SelectItem>
							<SelectItem value="fr">Français</SelectItem>
							<SelectItem value="ar">العربية</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
