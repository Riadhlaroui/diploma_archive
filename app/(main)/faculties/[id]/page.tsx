/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Check, Copy, Trash2, UserRoundPen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDepartments } from "@/app/src/services/facultieService";
import { useParams } from "next/navigation";

export default function DepartmentsPage() {
	const params = useParams(); // get route params
	const facultyId = typeof params.id === "string" ? params.id : undefined;

	console.log("Faculty ID:", facultyId);

	const { t } = useTranslation();
	const [departments, setDepartments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [copiedId, setCopiedId] = useState("");

	useEffect(() => {
		async function fetchDepartments() {
			if (!facultyId) {
				setDepartments([]);
				setTotalPages(1);
				setLoading(false);
				return;
			}
			setLoading(true);
			const data = await getDepartments(facultyId, page);
			setDepartments(data.items);
			setTotalPages(data.totalPages);
			setLoading(false);
		}

		fetchDepartments();
	}, [facultyId, page]);

	const handleEdit = (department: any) => {
		console.log("Edit", department);
	};

	const handleDelete = (department: any) => {
		console.log("Delete", department);
	};

	return (
		<div className="p-6 space-y-6">
			{/* Breadcrumb */}
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
								<DropdownMenuItem>{t("departments.title")}</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{t("departments.title")}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Table */}
			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>{t("departments.code")}</TableHead>
						<TableHead>{t("departments.name")}</TableHead>
						<TableHead>{t("departments.createdAt")}</TableHead>
						<TableHead>{t("departments.actions")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={4} className="text-center py-6">
								<Loader2 className="mx-auto animate-spin text-gray-500" />
								<span className="text-sm text-gray-500 mt-2 block">
									{t("loading")}
								</span>
							</TableCell>
						</TableRow>
					) : departments.length > 0 ? (
						departments.map((department) => (
							<TableRow
								key={department.id}
								className="hover:bg-gray-100 dark:hover:bg-zinc-800"
							>
								<TableCell>
									<span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{department.id}
										{copiedId === department.id ? (
											<Check size={14} className="text-green-600" />
										) : (
											<button
												onClick={() => {
													navigator.clipboard.writeText(department.id);
													setCopiedId(department.id);
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
								<TableCell>{department.name}</TableCell>
								<TableCell>
									{new Date(department.created).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleEdit(department)}
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete(department)}
											className="bg-[#f44336] text-white"
										>
											<Trash2 />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={4} className="text-center py-6 text-gray-500">
								{t("departments.notFound")}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={4} className="text-center py-3">
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
