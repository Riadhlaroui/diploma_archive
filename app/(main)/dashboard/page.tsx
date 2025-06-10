"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { checkAuthOrRedirect } from "../../src/services/authService";
import pb from "@/lib/pocketbase";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
	faculties: number;
	departments: number;
	majors: number;
	fields: number;
	specialties: number;
};

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex flex-col items-center justify-center border rounded-md p-4 bg-white dark:bg-gray-800 shadow">
			<span className="text-3xl font-bold">{value}</span>
			<span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
				{label}
			</span>
		</div>
	);
}

export default function DashboardPage() {
	const { t } = useTranslation();
	const router = useRouter();

	const [checkingAuth, setCheckingAuth] = useState(true);
	const [stats, setStats] = useState<Stats | null>(null);
	const [loadingStats, setLoadingStats] = useState(false);

	useEffect(() => {
		try {
			checkAuthOrRedirect(router);
			setCheckingAuth(false);
		} catch {}
	}, [router]);

	useEffect(() => {
		async function fetchStats() {
			setLoadingStats(true);
			try {
				const faculties = await pb
					.collection("Archive_faculties")
					.getList(1, 1);
				const departments = await pb
					.collection("Archive_departments")
					.getList(1, 1);
				const majors = await pb.collection("Archive_majors").getList(1, 1);
				const fields = await pb.collection("Archive_fields").getList(1, 1);
				const specialties = await pb
					.collection("Archive_specialties")
					.getList(1, 1);

				setStats({
					faculties: faculties.totalItems,
					departments: departments.totalItems,
					majors: majors.totalItems,
					fields: fields.totalItems,
					specialties: specialties.totalItems,
				});
			} catch (error) {
				console.error("Failed to fetch stats:", error);
			} finally {
				setLoadingStats(false);
			}
		}

		fetchStats();
	}, []);

	if (checkingAuth) return <Skeleton className="w-full h-full" />;

	return (
		<div className="w-full flex flex-col items-center justify-center gap-4 p-4">
			<h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>

			<div className="w-full h-fit border p-4 rounded-md">
				<h2 className="text-xl font-semibold mb-4">
					{t("dashboard.overview")}
				</h2>

				{loadingStats || !stats ? (
					<Skeleton className="w-full h-24" />
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
						<StatCard
							value={stats.faculties}
							label={t("dashboard.stats.faculties")}
						/>
						<StatCard
							value={stats.departments}
							label={t("dashboard.stats.departments")}
						/>
						<StatCard
							value={stats.fields}
							label={t("dashboard.stats.fields")}
						/>
						<StatCard
							value={stats.majors}
							label={t("dashboard.stats.majors")}
						/>
						<StatCard
							value={stats.specialties}
							label={t("dashboard.stats.specialties")}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
