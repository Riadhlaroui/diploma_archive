/* eslint-disable @typescript-eslint/no-unused-vars */
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
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { useTranslation } from "react-i18next";
import {
	FacultieList,
	getFaculties,
	deleteFaculty,
} from "@/app/src/services/facultieService";
import AddFacultyDialog from "@/components/AddFacultyDialog";
import { FacultyUpdateDialog } from "@/components/FacultyUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const FacultiesList = () => {
	const [logs, setLogs] = useState<FacultieList[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [totalPages, setTotalPages] = useState(1);
	const [page, setPage] = useState(1);
	const [copiedId, setCopiedId] = useState("");
	const [showDialog, setShowDialog] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	const router = useRouter();

	const [selectedFaculty, setSelectedFaculty] = useState<FacultieList | null>(
		null
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [facultyToDelete, setFacultyToDelete] = useState<FacultieList | null>(
		null
	);

	const handleEdit = (faculty: FacultieList) => {
		setSelectedFaculty(faculty);
		setIsDialogOpen(true);
	};

	const handleDelete = (faculty: FacultieList) => {
		setFacultyToDelete(faculty);
		setShowConfirmDialog(true);
	};

	const confirmDelete = async () => {
		if (!facultyToDelete) return;

		try {
			await deleteFaculty(facultyToDelete.id);
			toast.success(`Faculty '${facultyToDelete.name}' deleted successfully!`);
		} catch (error) {
			toast.error(`Failed to delete faculty '${facultyToDelete.name}'.`);
		}

		setShowConfirmDialog(false);
		setFacultyToDelete(null);
		await fetchFaculties(); // Refresh the list
	};

	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";

	useEffect(() => {
		fetchFaculties();
	}, [page, searchTerm]);

	const fetchFaculties = async () => {
		setLoading(true);
		try {
			const { items, totalPages } = await getFaculties(page, 10, searchTerm);
			setLogs(items);
			setTotalPages(totalPages);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full mt-10 p-6 rounded-md shadow-lg">
			<div className="flex gap-2 mb-4 items-center">
				<h3
					className="text-2xl font-semibold cursor-pointer hover:underline"
					onClick={() => window.location.reload()}
				>
					{t("faculties.title")}
				</h3>

				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					onClick={fetchFaculties}
					disabled={loading}
				>
					{loading ? (
						<Loader2 className="animate-spin text-black dark:text-white" />
					) : (
						<RefreshCcw className="text-black dark:text-white" />
					)}
				</Button>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					onClick={() => setShowDialog(true)}
				>
					<SquarePlus className="text-black" />
				</Button>
			</div>

			<div className="flex gap-2 mb-4">
				<div className="relative w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
					<input
						type="text"
						placeholder={t("search.facultyPlaceholder")}
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

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("faculties.code")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("faculties.name")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("faculties.departmentCount")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("faculties.actions")}
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
					) : logs.length > 0 ? (
						logs.map((faculty) => (
							<TableRow
								key={faculty.id}
								className="hover:bg-gray-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
								onDoubleClick={() =>
									router.push(`/faculties/departments?facultyId=${faculty.id}`)
								}
							>
								<TableCell>
									<span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{faculty.id}
										{copiedId === faculty.id ? (
											<Check size={14} className="text-green-600" />
										) : (
											<button
												onClick={() => {
													navigator.clipboard.writeText(faculty.id);
													setCopiedId(faculty.id);
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
								<TableCell>{faculty.name}</TableCell>
								<TableCell>{faculty.departmentCount ?? 0}</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											className="hover:cursor-pointer"
											size="sm"
											variant="outline"
											onClick={() => handleEdit(faculty)}
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete(faculty)}
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
							<TableCell colSpan={4} className="text-center py-6 text-gray-500">
								{t("faculties.notFound")}
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

			<FacultyUpdateDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				user={selectedFaculty}
			/>

			<ConfirmDialog
				open={showConfirmDialog}
				onClose={() => {
					setShowConfirmDialog(false);
					setFacultyToDelete(null);
				}}
				onConfirm={confirmDelete}
				title={t("confirm.title")}
				description={
					t("confirm.description", {
						name: facultyToDelete?.name || "",
					}) || `Are you sure you want to delete ${facultyToDelete?.name}?`
				}
			/>

			{showDialog && (
				<AddFacultyDialog
					onClose={() => {
						setShowDialog(false);
						fetchFaculties(); // refresh after adding
					}}
				/>
			)}
		</div>
	);
};

export default FacultiesList;
