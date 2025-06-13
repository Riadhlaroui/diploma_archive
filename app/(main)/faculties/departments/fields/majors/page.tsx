/* eslint-disable @typescript-eslint/no-explicit-any */
// app/majors/page.tsx or wherever appropriate
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
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";

import AddMajorDialog from "@/components/MajorsComponents/AddMajorDialog";
import { MajorUpdateDialog } from "@/components/MajorsComponents/MajorUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

import { toast } from "sonner";

import { deleteMajor, getMajors } from "@/app/src/services/majorService";
import { getFieldById } from "@/app/src/services/fieldService";

export default function MajorsPage() {
	const searchParams = useSearchParams();
	const fieldId = searchParams.get("fieldId");

	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";
	const router = useRouter();

	const [majors, setMajors] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [inputValue, setInputValue] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	const [showAddDialog, setShowAddDialog] = useState(false);
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [selectedMajor, setSelectedMajor] = useState<any | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [majorToDelete, setMajorToDelete] = useState<any | null>(null);

	const [fieldName, setFieldName] = useState<string>("");

	useEffect(() => {
		if (fieldId) {
			getFieldById(fieldId)
				.then((field) => {
					setFieldName(field?.name || "");
				})
				.catch(() => {
					setFieldName("");
				});
		}
	}, [fieldId]);

	const fetchMajors = useCallback(async () => {
		if (!fieldId) {
			setMajors([]);
			setTotalPages(1);
			setLoading(false);
			return;
		}
		setLoading(true);
		const data = await getMajors(fieldId, page, 10, searchTerm);
		setMajors(data.items);
		setTotalPages(data.totalPages);
		setLoading(false);
	}, [fieldId, page, searchTerm]);

	useEffect(() => {
		fetchMajors();
	}, [fetchMajors]);

	const handleEdit = (major: any) => {
		setSelectedMajor(major);
		setOpenUpdateDialog(true);
	};

	const handleDelete = (major: any) => {
		setMajorToDelete(major);
		setShowConfirmDialog(true);
	};

	const confirmDelete = async () => {
		if (!majorToDelete) return;

		try {
			await deleteMajor(majorToDelete.id);
			toast.success(t("majors.deleteSuccess", { name: majorToDelete.name }));
		} catch {
			toast.error(t("majors.deleteError", { name: majorToDelete.name }));
		}

		setShowConfirmDialog(false);
		setMajorToDelete(null);
		await fetchMajors();
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
						<BreadcrumbLink
							onClick={() => router.back()}
							className="hover:underline hover:cursor-pointer"
						>
							{t("fields.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink>{t("majors.title")}</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex gap-2 mb-4 items-center">
				<h3
					className="text-2xl font-semibold cursor-pointer hover:underline"
					dir={i18n.language === "ar" ? "rtl" : "ltr"}
					onClick={() => window.location.reload()}
				>
					{t("majors.titleWithfield", { field: fieldName })}
				</h3>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					disabled={loading}
					onClick={() => {
						setLoading(true);
						fetchMajors();
					}}
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
						placeholder={t("search.majorPlaceholder")}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						className="pl-9 pr-3 py-1 w-full border rounded dark:bg-zinc-800 dark:text-white"
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
							{t("majors.table.name")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("majors.table.specialtiesCount")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("majors.table.createdAt")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("majors.table.actions")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={4} className="text-center py-6">
								<Loader2 className="animate-spin mx-auto text-gray-500" />
								<span>{t("loading")}</span>
							</TableCell>
						</TableRow>
					) : majors.length > 0 ? (
						majors.map((major) => (
							<TableRow
								key={major.id}
								className="hover:bg-gray-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
								onDoubleClick={() => {
									router.push(
										`/faculties/departments/fields/majors/specialties?majorId=${major.id}`
									);
								}}
							>
								<TableCell>{major.name}</TableCell>
								<TableCell>{major.specialtiesCount ?? 0}</TableCell>
								<TableCell>
									{new Date(major.created).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleEdit(major)}
											className=" hover:cursor-pointer"
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete(major)}
											className=" hover:cursor-pointer"
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
								{t("majors.notFound")}
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

			<MajorUpdateDialog
				open={openUpdateDialog}
				onOpenChange={setOpenUpdateDialog}
				major={selectedMajor}
			/>

			<ConfirmDialog
				open={showConfirmDialog}
				onClose={() => {
					setShowConfirmDialog(false);
					setMajorToDelete(null);
				}}
				onConfirm={confirmDelete}
				title={t("confirm.title")}
				description={t("confirm.major.description", {
					name: majorToDelete?.name || "",
				})}
			/>

			{showAddDialog && fieldId && (
				<AddMajorDialog
					fieldId={fieldId}
					onClose={() => {
						setShowAddDialog(false);
						fetchMajors();
					}}
				/>
			)}
		</div>
	);
}
