/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getStudentsByDepartment } from "@/app/src/services/studentService";
import { getDepartmentById } from "@/app/src/services/departmentService";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	TableFooter,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
	BreadcrumbPage,
	BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"; // adjust path if needed

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // adjust path if needed

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function StudentsPage() {
	const { t } = useTranslation();
	const searchParams = useSearchParams();
	const departmentId = searchParams.get("departmentId");

	const [students, setStudents] = useState<any[]>([]);
	const [departmentName, setDepartmentName] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [loadingDept, setLoadingDept] = useState(true);

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const perPage = 10;

	useEffect(() => {
		if (!departmentId) return;

		async function fetchStudents() {
			setLoading(true);
			const data = await getStudentsByDepartment(
				departmentId as string,
				page,
				perPage
			);
			setStudents(data.items);
			setTotalPages(data.totalPages);
			setLoading(false);
		}

		fetchStudents();
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
					<BreadcrumbItem>
						<BreadcrumbPage>
							{loadingDept ? t("loading") : departmentName}
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="text-2xl font-bold mb-4">
				{t("students.inDepartment", {
					department: departmentName || departmentId,
				})}
			</h1>

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>{t("students.table.id")}</TableHead>
						<TableHead>{t("students.table.name")}</TableHead>
						<TableHead>{t("students.table.email")}</TableHead>
						<TableHead>{t("students.table.createdAt")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={4} className="text-center py-6">
								<Loader2 className="mx-auto animate-spin text-gray-500" />
							</TableCell>
						</TableRow>
					) : students.length > 0 ? (
						students.map((student) => (
							<TableRow key={student.id}>
								<TableCell>{student.id}</TableCell>
								<TableCell>{student.name}</TableCell>
								<TableCell>{student.email}</TableCell>
								<TableCell>
									{new Date(student.created).toLocaleDateString()}
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={4} className="text-center py-6 text-gray-500">
								{t("students.noStudentsFound")}
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
