/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
	Search,
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

import { getMajorById } from "@/app/src/services/majorService";
import { getSpecialtiesByMajor } from "@/app/src/services/specialtyService";

import { SpecialtyUpdateDialog } from "@/components/SpecialtyUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { deleteSpecialtyById } from "@/app/src/services/specialtyService";
import AddSpecialtyDialog from "@/components/AddSpecialtyDialog";

export default function SpecialtiesPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";

	const majorId = searchParams.get("majorId");

	const [specialties, setSpecialties] = useState<any[]>([]);
	const [majorName, setMajorName] = useState<string>("");
	const [loading, setLoading] = useState(true);

	const [copiedId, setCopiedId] = useState("");

	const [inputValue, setInputValue] = useState(""); // What user types
	const [searchTerm, setSearchTerm] = useState(""); // Triggers search

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const perPage = 10;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedSpecialty, setSelectedSpecialty] = useState<any | null>(null);

	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [specialtyToDelete, setSpecialtyToDelete] = useState<any | null>(null);

	const fetchSpecialties = async () => {
		if (!majorId) return;
		setLoading(true);
		const data = await getSpecialtiesByMajor(majorId, page, perPage);
		if (Array.isArray(data)) {
			setSpecialties(data);
			setTotalPages(1);
		} else {
			setSpecialties(data.items);
			setTotalPages(data.totalPages);
		}
		setLoading(false);
	};

	// Fix the setEditDialogData handler
	const setEditDialogData = (specialty: any) => {
		setSelectedSpecialty(specialty);
		setIsDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!specialtyToDelete) return;
		try {
			await deleteSpecialtyById(specialtyToDelete.id);
			toast.success(
				`Specialty '${specialtyToDelete.name}' deleted successfully!`
			);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error(`Failed to delete specialty '${specialtyToDelete.name}'.`);
		}
		setShowConfirmDialog(false);
		setSpecialtyToDelete(null);
	};

	useEffect(() => {
		fetchSpecialties();
	}, [majorId, page, searchTerm]);

	useEffect(() => {
		if (!majorId) return;
		async function fetchDepartmentName() {
			setLoading(true);
			try {
				const major = await getMajorById(majorId as string);
				setMajorName(major?.name || "Unknown major");
			} catch {
				setMajorName("Unknown major");
			}
			setLoading(false);
		}
		fetchDepartmentName();
	}, [majorId, t]);

	return (
		<div className="p-6">
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
						<BreadcrumbLink
							onClick={() => router.back()}
							className="hover:underline hover:cursor-pointer"
						>
							{t("fields.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink
							onClick={() => router.back()}
							className="hover:underline hover:cursor-pointer"
						>
							{t("majors.title")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage className="text-gray-500">
							{t("specialties.title")}
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex gap-2 mb-4 items-center mt-4">
				<h3
					className="text-2xl font-semibold cursor-pointer hover:underline"
					dir={i18n.language === "ar" ? "rtl" : "ltr"}
					onClick={() => window.location.reload()}
				>
					{t("specialties.titleWithMajor", { major: majorName })}
				</h3>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					disabled={loading}
					onClick={fetchSpecialties}
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
						placeholder="Search specialties..."
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
					Search
				</button>
			</div>

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("specialties.code")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("specialties.name")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("specialties.createdAt")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("specialties.actions")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={4} className="text-center py-6">
								<Loader2 className="mx-auto animate-spin text-gray-500" />
							</TableCell>
						</TableRow>
					) : specialties.length > 0 ? (
						specialties.map((specialtie) => (
							<TableRow key={specialtie.id}>
								<TableCell>
									<span className="inline-flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full">
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
											>
												<Copy size={14} />
											</button>
										)}
									</span>
								</TableCell>
								<TableCell>{specialtie.name}</TableCell>

								<TableCell>
									{new Date(specialtie.created).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => setEditDialogData(specialtie)}
											className=" hover:cursor-pointer"
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											className="hover:cursor-pointer"
											onClick={() => {
												setSpecialtyToDelete(specialtie);
												setShowConfirmDialog(true);
											}}
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
								{t("specialties.notFound")}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={4} className="text-center py-3">
							<div className="flex justify-center items-center gap-4">
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.max(p - 1, 1))}
									disabled={page === 1 || loading}
									className=" hover:cursor-pointer"
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
									className=" hover:cursor-pointer"
								>
									{t("pagination.next")}
								</Button>
							</div>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>

			{showAddDialog && majorId && (
				<AddSpecialtyDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					majorId={majorId}
					onClose={() => {
						setShowAddDialog(false);
						fetchSpecialties();
					}}
				/>
			)}

			<ConfirmDialog
				open={showConfirmDialog}
				onClose={() => {
					setShowConfirmDialog(false);
					setSpecialtyToDelete(null);
				}}
				onConfirm={confirmDelete}
				title={t("confirm.title")}
				description={
					t("confirm.specialty.description", {
						name: specialtyToDelete?.name || "",
						entity: t("confirm.specialty.entities.specialty"),
					}) || `Are you sure you want to delete ${specialtyToDelete?.name}?`
				}
			/>

			<SpecialtyUpdateDialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open);
					if (!open) setSelectedSpecialty(null); // Reset on close
				}}
				specialty={selectedSpecialty}
			/>
		</div>
	);
}
