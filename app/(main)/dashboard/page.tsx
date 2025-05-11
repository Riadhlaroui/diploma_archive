// app/dashboard/page.tsx
"use client";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { checkAuthOrRedirect } from "../../src/services/authService";

import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
	const { t } = useTranslation();

const Dashboard = () => {
	const router = useRouter();

	const [showAddForm, setShowAddForm] = useState(false);
	const { t, i18n } = useTranslation();

	const [checkingAuth, setCheckingAuth] = React.useState(true);
	const [checkingAuth, setCheckingAuth] = useState(true);
	const router = useRouter();

	useEffect(() => {
		try {
			checkAuthOrRedirect(router);
			setCheckingAuth(false);
		} catch {}
	}, [router]);

	if (checkingAuth) return <Skeleton className="w-full h-full" />;

	return (
		<div className="w-full flex flex-col items-center justify-center gap-4 p-4">
			<h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>

			<form className="flex items-center justify-center w-full">
				<input
					name="query"
					placeholder={t("dashboard.searchPlaceholder")}
					className="border p-3 w-[40%] h-[2.5rem] focus:outline-none"
				/>
				<button
					type="submit"
					className="border-b border-t border-r p-2 h-[2.5rem] rounded-r-lg"
				>
					<Search />
				</button>
			</form>

			<div className="w-full h-full border">{/* content */}</div>
		</div>
	);
}