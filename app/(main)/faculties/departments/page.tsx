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
import {
	Loader2,
	Trash2,
	UserRoundPen,
	RefreshCcw,
	SquarePlus,
	Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getFacultyById } from "@/app/src/services/facultieService";
import { useRouter, useSearchParams } from "next/navigation";

import AddDepartmentDialog from "@/components/DepartmentsComponents/AddDepartmentDialog";
import { DepartmentUpdateDialog } from "@/components/DepartmentsComponents/DepartmentUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

import {
	deleteDepartment,
	getDepartments,
} from "@/app/src/services/departmentService";

export default function DepartmentsPage() {
	const searchParams = useSearchParams();
	const facultyId = searchParams.get("facultyId");

	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";
	const [departments, setDepartments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [inputValue, setInputValue] = useState(""); // What user types
	const [searchTerm, setSearchTerm] = useState(""); // Triggers search

	const [showAddDialog, setShowAddDialog] = useState(false);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	const [selectedDepartment, setSelectedDepartment] = useState<any | null>(
		null,
	);
	const [departmentToDelete, setDepartmentToDelete] = useState<any | null>(
		null,
	);

	const router = useRouter();

	const [facultyName, setFacultyName] = useState<string>("");

	useEffect(() => {
		if (facultyId) {
			getFacultyById(facultyId)
				.then((faculty) => {
					setFacultyName(faculty?.name || "");
				})
				.catch(() => {
					setFacultyName("");
				});
		}
	}, [facultyId]);

	const fetchDepartments = async () => {
		if (!facultyId) {
			setDepartments([]);
			setTotalPages(1);
			setLoading(false);
			return;
		}
		setLoading(true);
		const data = await getDepartments(facultyId, page, 10, searchTerm);

		setDepartments(data.items);
		setTotalPages(data.totalPages);
		setLoading(false);
	};

	useEffect(() => {
		fetchDepartments();
	}, [facultyId, page, searchTerm]);

	const handleEdit = (department: any) => {
		setSelectedDepartment(department);
		setIsDialogOpen(true);
	};

	const handleDelete = (department: any) => {
		setDepartmentToDelete(department);
		setShowConfirmDialog(true);
	};

	const confirmDelete = async () => {
		if (!departmentToDelete) return;

		try {
			await deleteDepartment(departmentToDelete.id);
			toast.success(
				t("departments.deleteSuccess", { name: departmentToDelete.name }),
			);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error(
				t("departments.deleteError", { name: departmentToDelete.name }),
			);
		}

		setShowConfirmDialog(false);
		setDepartmentToDelete(null);
		await fetchDepartments();
	};

	return (
		<div className="p-6 space-y-6">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/dashboard">
							{t("navigation.home")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<DropdownMenu>
							<DropdownMenuTrigger className="flex items-center gap-1">
								<BreadcrumbEllipsis className="h-4 w-4" />
								<span className="sr-only">Toggle menu</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuItem className=" cursor-pointer">
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
						<BreadcrumbLink
							href="/faculties"
							className="hover:underline hover:cursor-pointer"
						>
							{t("faculties.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{t("departments.title")}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex gap-2 mb-4 items-center">
				<h3
					className="text-2xl font-semibold cursor-pointer hover:underline"
					dir={i18n.language === "ar" ? "rtl" : "ltr"}
					onClick={() => window.location.reload()}
				>
					{t("departments.titleWithFaculty", { faculty: facultyName })}
				</h3>

				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2"
					disabled={loading}
					onClick={fetchDepartments}
				>
					{loading ? (
						<Loader2 className="animate-spin text-black dark:text-white" />
					) : (
						<RefreshCcw className="text-black dark:text-white" />
					)}
				</Button>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2"
					onClick={() => setShowAddDialog(true)}
				>
					<SquarePlus className="text-black" />
				</Button>
			</div>

			<div className="flex gap-2 mb-4">
				<div className="relative w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
					<input
						type="text"
						placeholder={t("search.departmentPlaceholder")}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						className="pl-9 pr-3 py-1 w-full border rounded dark:bg-zinc-800 dark:text-white transition-colors"
					/>
				</div>
				<button
					onClick={() => {
						setPage(1);
						setSearchTerm(inputValue.trim());
					}}
					className="px-4 py-1 rounded border hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
				>
					{t("search.button")}
				</button>
			</div>
			<div className="flex-1 overflow-auto bg-white border rounded-2xl">
				<Table className="text-sm rounded-xl shadow-lg bg-white">
					<TableHeader>
						<TableRow>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("departments.name")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("departments.fieldsCount")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("departments.createdAt")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("departments.actions")}
							</TableHead>
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
									className="hover:bg-gray-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
									onDoubleClick={() => {
										router.push(
											`/faculties/departments/fields?departmentId=${department.id}`,
										);
									}}
								>
									<TableCell>{department.name}</TableCell>
									<TableCell>{department.fieldsCount ?? 0}</TableCell>
									<TableCell>
										{new Date(department.created).toLocaleDateString()}
									</TableCell>

									<TableCell>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleEdit(department)}
												className="hover:cursor-pointer"
											>
												<UserRoundPen />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												className="bg-[#f44336] text-white hover:cursor-pointer"
												onClick={() => handleDelete(department)}
											>
												<Trash2 />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-6 text-gray-500"
								>
									{t("departments.noDepartments")}
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
										className="hover:cursor-pointer"
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
										className="hover:cursor-pointer"
									>
										{t("pagination.next")}
									</Button>
								</div>
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</div>

			<DepartmentUpdateDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				user={selectedDepartment}
			/>

			<ConfirmDialog
				open={showConfirmDialog}
				onClose={() => {
					setShowConfirmDialog(false);
					setDepartmentToDelete(null);
				}}
				onConfirm={confirmDelete}
				title={t("confirm.title")}
				description={
					t("confirm.department.description", {
						name: departmentToDelete?.name || "",
						entity: t("confirm.department.entities.department"),
					}) ||
					`هل أنت متأكد من حذف الـ القسم "${departmentToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
				}
			/>

			{showAddDialog && facultyId && (
				<AddDepartmentDialog
					facultyId={facultyId}
					onClose={() => {
						setShowAddDialog(false);
						fetchDepartments();
					}}
				/>
			)}
		</div>
	);
}
