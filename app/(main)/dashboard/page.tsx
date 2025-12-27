/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { checkAuthOrRedirect } from "../../src/services/authService";
import pb from "@/lib/pocketbase";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ListTree,
	ChevronRight,
	ChevronDown,
	Loader2,
	X,
	Shrink,
	ChevronLeft,
} from "lucide-react";
import { t } from "i18next";

const HIERARCHY_MAP: Record<
	string,
	{ childCollection: string; foreignKey: string; labelField: string }
> = {
	root: {
		childCollection: "Archive_faculties",
		foreignKey: "",
		labelField: "name",
	},
	Archive_faculties: {
		childCollection: "Archive_departments",
		foreignKey: "facultyId",
		labelField: "name",
	},
	Archive_departments: {
		childCollection: "Archive_fields",
		foreignKey: "departmentId",
		labelField: "name",
	},
	Archive_fields: {
		childCollection: "Archive_majors",
		foreignKey: "fieldId",
		labelField: "name",
	},
	Archive_majors: {
		childCollection: "Archive_specialties",
		foreignKey: "majorId",
		labelField: "name",
	},
};

function TreeNode({
	collection,
	id,
	label,
	depth = 0,
}: {
	collection: string;
	id: string;
	label: string;
	depth?: number;
}) {
	const { i18n } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [children, setChildren] = useState<any[]>([]);
	const [hasFetched, setHasFetched] = useState(false);

	const config = HIERARCHY_MAP[collection];
	const isLeaf = !config || !config.childCollection;

	const handleToggle = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isLeaf) return;

		if (!isOpen && !hasFetched) {
			setLoading(true);
			try {
				const result = await pb
					.collection(config.childCollection)
					.getList(1, 50, {
						filter: `${config.foreignKey} = "${id}"`,
						sort: "-created",
					});
				setChildren(result.items);
				setHasFetched(true);
			} catch (err) {
				console.error("Error fetching children:", err);
			} finally {
				setLoading(false);
			}
		}
		setIsOpen(!isOpen);
	};

	const indentationClass = `ps-${depth * 4}`;

	const isRtl = i18n.dir() === "rtl";
	const borderContainerClasses = isRtl
		? `border-r mr-2 border-gray-200 dark:border-gray-600`
		: `border-l ml-2 border-gray-200 dark:border-gray-600`;

	return (
		<div
			className={`select-none text-gray-800 dark:text-gray-200 ${indentationClass}`}
		>
			<div
				className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
				onClick={handleToggle}
			>
				<div className="text-gray-400 w-4 h-4 flex items-center justify-center shrink-0">
					{loading ? (
						<Loader2 className="w-3 h-3 animate-spin" />
					) : isLeaf ? (
						<div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
					) : isOpen ? (
						<ChevronDown className="w-4 h-4" />
					) : isRtl ? (
						<ChevronLeft className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
				</div>

				<span className="text-sm font-medium truncate">{label}</span>

				<span className="text-[10px] uppercase text-gray-400 dark:text-gray-500 ms-auto border dark:border-gray-600 px-1 rounded bg-gray-50 dark:bg-gray-800">
					{collection.replace("Archive_", "")}
				</span>
			</div>

			{isOpen && (
				<div className={`flex flex-col ${borderContainerClasses}`}>
					{children.length === 0 && !loading ? (
						<div className="py-1 text-xs text-gray-400 italic ps-2">
							{t("dashboard.hierarchy.noItems")}
						</div>
					) : (
						children.map((child) => {
							const nextCollection = config.childCollection;
							const nextLabel = child.name || child.title || child.id;
							return (
								<TreeNode
									key={child.id}
									collection={nextCollection}
									id={child.id}
									label={nextLabel}
									depth={depth + 1}
								/>
							);
						})
					)}
				</div>
			)}
		</div>
	);
}

function HierarchyDialog({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const [roots, setRoots] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		}
		if (isOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (isOpen) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			setLoading(true);
			pb.collection("Archive_faculties")
				.getList(1, 50)
				.then((res) => setRoots(res.items))
				.catch((err) => console.error(err))
				.finally(() => setLoading(false));
		}
	}, [isOpen, refreshKey]);

	const handleCollapseAll = () => {
		setRefreshKey((prev) => prev + 1);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div
				ref={modalRef}
				className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
			>
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{t("dashboard.hierarchy.title")}
					</h3>
					<div className="flex items-center gap-2">
						<button
							onClick={handleCollapseAll}
							className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
						>
							<Shrink className="w-4 h-4" />
						</button>
						<button
							onClick={onClose}
							className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							title={t("common.close")}
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
					{loading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
						</div>
					) : (
						<div className="space-y-1">
							{roots.map((faculty) => (
								<TreeNode
									key={`${faculty.id}-${refreshKey}`} // Added refreshKey to force component remount on collapse
									collection="Archive_faculties"
									id={faculty.id}
									label={faculty.name || faculty.title || "Unnamed Faculty"}
									depth={0} // Roots always have depth 0
								/>
							))}
						</div>
					)}
				</div>

				<div className="px-6 py-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 text-right">
					{t("dashboard.hierarchy.hint")}
				</div>
			</div>
		</div>
	);
}

type Stats = {
	faculties: number;
	departments: number;
	majors: number;
	fields: number;
	specialties: number;
};

function StatCard({
	label,
	value,
	onIconClick,
	showIcon = false,
}: {
	label: string;
	value: number;
	onIconClick: () => void;
	showIcon?: boolean;
}) {
	// ... StatCard remains unchanged (using old t(..)) or updated t(..) as requested
	return (
		<div className="relative flex flex-col items-center justify-center border rounded-md p-4 bg-white dark:bg-gray-800 shadow transition-all hover:shadow-md">
			{showIcon && (
				<div
					className="absolute top-2 right-2 p-1.5 rounded-md text-gray-400  hover:text-[#86898f] hover:bg-blue-50 cursor-pointer transition-all"
					onClick={(e) => {
						e.stopPropagation();
						onIconClick();
					}}
					title={t("dashboard.hierarchy.viewHierarchy")} // Assumed new translation key
				>
					<ListTree className="size-5" />
				</div>
			)}

			<span className="text-3xl font-bold text-gray-900 dark:text-white">
				{value}
			</span>
			<span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
				{label}
			</span>
		</div>
	);
}

export default function DashboardPage() {
	// ... (rest of DashboardPage remains the same)
	const { t } = useTranslation();
	const router = useRouter();

	const [checkingAuth, setCheckingAuth] = useState(true);
	const [stats, setStats] = useState<Stats | null>(null);
	const [loadingStats, setLoadingStats] = useState(false);
	const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);

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

	if (checkingAuth) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
				<div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-transparent rounded-full"></div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col items-center justify-start gap-4 p-4 pt-10  bg-gray-50 dark:bg-black text-black dark:text-white min-w-0">
			<HierarchyDialog
				isOpen={isHierarchyOpen}
				onClose={() => setIsHierarchyOpen(false)}
			/>

			<h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>

			<div className="w-full h-fit border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
				<h2 className="text-xl font-semibold mb-6">
					{t("dashboard.overview")}
				</h2>

				{loadingStats || !stats ? (
					<Skeleton className="w-full h-24" />
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
						<StatCard
							value={stats.faculties}
							label={t("dashboard.stats.faculties")}
							onIconClick={() => setIsHierarchyOpen(true)}
							showIcon={true}
						/>
						<StatCard
							value={stats.departments}
							label={t("dashboard.stats.departments")}
							onIconClick={() => setIsHierarchyOpen(true)}
							showIcon={false}
						/>
						<StatCard
							value={stats.fields}
							label={t("dashboard.stats.fields")}
							onIconClick={() => setIsHierarchyOpen(true)}
							showIcon={false}
						/>
						<StatCard
							value={stats.majors}
							label={t("dashboard.stats.majors")}
							onIconClick={() => setIsHierarchyOpen(true)}
							showIcon={false}
						/>
						<StatCard
							value={stats.specialties}
							label={t("dashboard.stats.specialties")}
							onIconClick={() => setIsHierarchyOpen(true)}
							showIcon={false}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
