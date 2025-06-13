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
import { useRouter, useSearchParams } from "next/navigation";

import AddFieldDialog from "@/components/FieldsComponents/AddFieldDialog";
import { FieldUpdateDialog } from "@/components/FieldsComponents/FieldUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

import { toast } from "sonner";

import { deleteField, getFields } from "@/app/src/services/fieldService";

import { getDepartmentById } from "@/app/src/services/departmentService";

export default function FieldsPage() {
	const searchParams = useSearchParams();
	const departmentId = searchParams.get("departmentId");

	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";
	const router = useRouter();

	const [fields, setFields] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [inputValue, setInputValue] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	const [showAddDialog, setShowAddDialog] = useState(false);
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [selectedField, setSelectedField] = useState<any | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	const [fieldToDelete, setFieldToDelete] = useState<any | null>(null);

	const [departmentName, setDepartmentName] = useState<string>("");

	useEffect(() => {
		if (departmentId) {
			getDepartmentById(departmentId)
				.then((department) => {
					setDepartmentName(department?.name || "");
				})
				.catch(() => {
					setDepartmentName("");
				});
		}
	}, [departmentId]);

	const fetchFields = async () => {
		if (!departmentId) {
			setFields([]);
			setTotalPages(1);
			setLoading(false);
			return;
		}
		setLoading(true);
		const data = await getFields(departmentId, page, 10, searchTerm);
		setFields(data.items);
		setTotalPages(data.totalPages);
		setLoading(false);
	};

	useEffect(() => {
		fetchFields();
	}, [departmentId, page, searchTerm]);

	const handleEdit = (field: any) => {
		setSelectedField(field);
		setOpenUpdateDialog(true);
	};

	const handleDelete = (field: any) => {
		setFieldToDelete(field);
		setShowConfirmDialog(true);
	};

	const confirmDelete = async () => {
		if (!fieldToDelete) return;

		try {
			await deleteField(fieldToDelete.id);
			toast.success(t("fields.deleteSuccess", { name: fieldToDelete.name }));
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error(t("fields.deleteError", { name: fieldToDelete.name }));
		}

		setShowConfirmDialog(false);
		setFieldToDelete(null);
		await fetchFields();
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
						<BreadcrumbLink
							href="/faculties"
							className="hover:underline hover:cursor-pointer"
						>
							{t("faculties.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink
							onClick={() => router.back()}
							className="hover:underline hover:cursor-pointer"
						>
							{t("departments.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink>{t("fields.title")}</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex gap-2 mb-4 items-center">
				<h3
					className="text-2xl font-semibold cursor-pointer hover:underline"
					dir={i18n.language === "ar" ? "rtl" : "ltr"}
					onClick={() => window.location.reload()}
				>
					{t("fields.titleWithDepartment", { department: departmentName })}
				</h3>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					disabled={loading}
					onClick={fetchFields}
				>
					{loading ? (
						<Loader2 className="animate-spin text-black dark:text-white" />
					) : (
						<RefreshCcw className="text-black dark:text-white" />
					)}
				</Button>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
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
						placeholder={t("search.fieldPlaceholder")}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						className="pl-9 pr-3 py-1 w-full border rounded dark:bg-zinc-800 dark:text-white transition-colors"
					/>
				</div>
				<Button
					onClick={() => {
						setPage(1);
						setSearchTerm(inputValue.trim());
					}}
					variant="outline"
				>
					{t("search.button")}
				</Button>
			</div>

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("fields.name")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("fields.MajorsCount")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("fields.createdAt")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("fields.actions")}
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
					) : fields.length > 0 ? (
						fields.map((field) => (
							<TableRow
								key={field.id}
								className="hover:bg-gray-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
								onDoubleClick={() => {
									router.push(
										`/faculties/departments/fields/majors?fieldId=${field.id}`
									);
								}}
							>
								<TableCell>{field.name}</TableCell>
								<TableCell>{field.majorsCount ?? 0}</TableCell>
								<TableCell>
									{new Date(field.created).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleEdit(field)}
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete(field)}
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
								{t("fields.notFound")}
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

			<FieldUpdateDialog
				open={openUpdateDialog}
				onOpenChange={setOpenUpdateDialog}
				user={selectedField}
			/>

			<ConfirmDialog
				open={showConfirmDialog}
				onClose={() => {
					setShowConfirmDialog(false);
					setFieldToDelete(null);
				}}
				onConfirm={confirmDelete}
				title={t("confirm.title")}
				description={t("confirm.field.description", {
					name: fieldToDelete?.name || "",
					entity: t("confirm.field.entities.field"),
				})}
			/>

			{showAddDialog && departmentId && (
				<AddFieldDialog
					departmentId={departmentId}
					onClose={() => {
						setShowAddDialog(false);
						fetchFields();
					}}
				/>
			)}
		</div>
	);
}
