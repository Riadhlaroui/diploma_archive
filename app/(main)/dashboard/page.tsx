"use client";
import "@/lib/i18n"; // ✅ Forces i18n to initialize
import { useTranslation } from "react-i18next";

import { Search, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

import StudentFormDialog from "@/components/StudentFormDialog";

const Dashboard = () => {
	const router = useRouter();

	const [showAddForm, setShowAddForm] = useState(false);
	const { t, i18n } = useTranslation();

	const [checkingAuth, setCheckingAuth] = React.useState(true);

	useEffect(() => {
		if (!pb.authStore.isValid) {
			router.replace("/sign-in");
		} else {
			setCheckingAuth(false);
		}
	}, [router]);

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

	if (checkingAuth) return <Skeleton className="w-full h-full" />;

	return (
		<div className="w-full flex flex-col items-center justify-center gap-2 transition-colors duration-300">
			<div className="top-0 right-0 absolute p-4">
				<ThemeToggle />
			</div>
			this the dashboard page
			<form action={""} className="flex items-center justify-center w-full">
				<input
					name="query"
					className=" border p-3 w-[40%] h-[2.5rem] focus:outline-none"
				/>

				<button
					type="submit"
					className=" border-b border-t border-r p-2 h-[2.5rem] rounded-r-lg"
				>
					{" "}
					<Search />
				</button>
			</form>
			<button
				onClick={() => setShowAddForm(true)}
				className="ml-4 flex items-center rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
			>
				<Plus className="mr-1 h-4 w-4" />
				New
			</button>
			<StudentFormDialog
				isOpen={showAddForm}
				onClose={() => setShowAddForm(false)}
			/>
			<div className="w-full h-full border"></div>
		</div>
	);
};

export default Dashboard;
