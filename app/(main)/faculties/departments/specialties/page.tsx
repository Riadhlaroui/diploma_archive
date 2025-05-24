/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
	getDepartmentById,
	getSpecialtiesByDepartment,
} from "@/app/src/services/departmentService";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	TableFooter,
} from "@/components/ui/table";
import {
	Check,
	Copy,
	Loader2,
	RefreshCcw,
	SquarePlus,
	Trash2,
	UserRoundPen,
} from "lucide-react";

import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
	BreadcrumbPage,
	BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function SpecialtiesPage() {
	const { t } = useTranslation();
	const searchParams = useSearchParams();
	const departmentId = searchParams.get("departmentId");

	const [specialties, setSpecialties] = useState<any[]>([]);
	const [departmentName, setDepartmentName] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [loadingDept, setLoadingDept] = useState(true);
	const [copiedId, setCopiedId] = useState("");

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const perPage = 10;

	useEffect(() => {
		if (!departmentId) return;

		async function fetchSpecialties() {
			setLoading(true);
			const data = await getSpecialtiesByDepartment(
				departmentId as string,
				page,
				perPage
			);
			setSpecialties(data.items);
			setTotalPages(data.totalPages);
			setLoading(false);
		}

		fetchSpecialties();
	}, [departmentId, page]);

	const router = useRouter();

	useEffect(() => {
		if (!departmentId) return;

		async function fetchDepartmentName() {
			setLoadingDept(true);
			try {
				const dept = await getDepartmentById(departmentId as string);
				setDepartmentName(dept?.name || t("departments.unknown"));
			} catch {
				setDepartmentName(t("departments.unknown"));
			}
			setLoadingDept(false);
		}

		fetchDepartmentName();
	}, [departmentId, t]);

	function handleEdit(): void {
		throw new Error("Function not implemented.");
	}

	function handleDelete(): void {
		throw new Error("Function not implemented.");
	}

	return (
		<div className="p-6">
			{/* Breadcrumbs */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">{t("navigation.home")}</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<DropdownMenu>
							<DropdownMenuTrigger className="flex items-center gap-1">
								<BreadcrumbEllipsis className="h-4 w-4" />
								<span className="sr-only">Toggle menu</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuItem>
									<BreadcrumbLink href="/faculties">
										{t("faculties.title")}
									</BreadcrumbLink>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => router.back()}>
									{t("departments.title")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem className="cursor-pointer">
						<BreadcrumbLink
							href="/faculties"
							className="hover:underline hover:cursor-pointer"
						>
							{t("faculties.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem className="cursor-pointer">
						<BreadcrumbLink
							onClick={() => router.back()}
							className="hover:underline hover:cursor-pointer"
						>
							{t("departments.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>
							{loadingDept ? t("loading") : departmentName}
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex gap-2 mb-4 items-center mt-4">
				<h3 className="text-2xl font-semibold">
					Specialties in {departmentName}
				</h3>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					disabled={loading}
				>
					{loading ? (
						<Loader2 className="animate-spin text-black dark:text-white" />
					) : (
						<RefreshCcw className="text-black dark:text-white" />
					)}
				</Button>
				<Button className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer">
					<SquarePlus className="text-black" />
				</Button>
			</div>

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>Code</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Major</TableHead>
						<TableHead>Created At</TableHead>
						<TableHead>{t("actions.title")}</TableHead>{" "}
						{/* New Actions Header */}
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center py-6">
								<Loader2 className="mx-auto animate-spin text-gray-500" />
							</TableCell>
						</TableRow>
					) : specialties.length > 0 ? (
						specialties.map((specialtie) => (
							<TableRow key={specialtie.id}>
								<TableCell>
									<span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{specialtie.id}
										{copiedId === specialtie.id ? (
											<Check size={14} className="text-green-600" />
										) : (
											<button
												onClick={() => {
													navigator.clipboard.writeText(specialtie.id);
													setCopiedId(specialtie.id);
													setTimeout(() => setCopiedId(""), 1500);
												}}
												aria-label={t("actions.copyId")}
												className="hover:text-blue-500"
											>
												<Copy size={14} />
											</button>
										)}
									</span>
								</TableCell>
								<TableCell>{specialtie.name}</TableCell>
								<TableCell>{specialtie.major}</TableCell>
								<TableCell>
									{new Date(specialtie.created).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											className="hover:cursor-pointer"
											size="sm"
											variant="outline"
											onClick={() => handleEdit()}
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete()}
											className="bg-[#f44336] text-white hover:cursor-pointer"
										>
											<Trash2 />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="text-center py-6 text-gray-500">
								{t("specialties.notFound")}
							</TableCell>
						</TableRow>
					)}
				</TableBody>

				<TableFooter>
					<TableRow>
						<TableCell colSpan={5} className="text-center py-3">
							<div className="flex items-center justify-center gap-4">
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.max(p - 1, 1))}
									disabled={page === 1 || loading}
								>
									{t("pagination.previous")}
								</Button>
								<span className="text-sm">
									{t("pagination.pageOf", { page, totalPages })}
								</span>
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
									disabled={page >= totalPages || loading}
								>
									{t("pagination.next")}
								</Button>
							</div>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	);
}
