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
	Check,
	Copy,
	Trash2,
	UserRoundPen,
	RefreshCcw,
	SquarePlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	getDepartments,
	getFacultyById,
} from "@/app/src/services/facultieService";
import { useRouter, useSearchParams } from "next/navigation";

import AddDepartmentDialog from "@/components/AddDepartmentDialog";
import { DepartmentUpdateDialog } from "@/components/DepartmentUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";

import { deleteDepartment } from "@/app/src/services/departmentService";

export default function DepartmentsPage() {
	const searchParams = useSearchParams();
	const facultyId = searchParams.get("facultyId");

	const { t } = useTranslation();
	const [departments, setDepartments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [copiedId, setCopiedId] = useState("");

	const [showAddDialog, setShowAddDialog] = useState(false);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	const [selectedDepartment, setSelectedDepartment] = useState<any | null>(
		null
	);
	const [departmentToDelete, setDepartmentToDelete] = useState<any | null>(
		null
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
		const data = await getDepartments(facultyId, page);
		setDepartments(data.items);
		setTotalPages(data.totalPages);
		setLoading(false);
	};

	useEffect(() => {
		fetchDepartments();
	}, [facultyId, page]);

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
				`Department '${departmentToDelete.name}' deleted successfully!`
			);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error(`Failed to delete department '${departmentToDelete.name}'.`);
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
						<BreadcrumbLink href="/faculties">
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
				<h3 className="text-2xl font-semibold">
					{t("departments.title")} in {facultyName}
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

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>{t("departments.code")}</TableHead>
						<TableHead>{t("departments.name")}</TableHead>
						<TableHead>{t("departments.specialtiesCount")}</TableHead>
						<TableHead>{t("departments.createdAt")}</TableHead>
						<TableHead>{t("departments.actions")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center py-6">
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
										`/faculties/departments/specialties?departmentId=${department.id}`
									);
								}}
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
								<TableCell>{department.specialtiesCount ?? 0}</TableCell>
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
							<TableCell colSpan={5} className="text-center py-6 text-gray-500">
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
					t("confirm.description", {
						name: departmentToDelete?.name || "",
					}) || `Are you sure you want to delete ${departmentToDelete?.name}?`
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
