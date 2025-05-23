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
	SquarePlus,
	Trash2,
	UserRoundPen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { FacultieList, getFaculties } from "@/app/src/services/facultieService";
import AddFacultyDialog from "@/components/AddFacultyDialog";
import { FacultyUpdateDialog } from "@/components/FacultyUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";

const FacultiesList = () => {
	const [logs, setLogs] = useState<FacultieList[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [totalPages, setTotalPages] = useState(1);
	const [page, setPage] = useState(1);
	const [copiedId, setCopiedId] = useState("");
	const [showDialog, setShowDialog] = useState(false);

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

		// TODO: Replace this with actual delete logic
		console.log("Deleting faculty:", facultyToDelete.id);

		setShowConfirmDialog(false);
		setFacultyToDelete(null);
		await fetchFaculties(); // Refresh after deletion
	};

	const { t } = useTranslation();

	useEffect(() => {
		fetchFaculties();
	}, [page]); // re-fetch when page changes

	const fetchFaculties = async () => {
		setLoading(true);
		try {
			const { items, totalPages } = await getFaculties(page, 10); // 10 items per page
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
				<h3 className="text-2xl font-semibold">{t("faculties.title")}</h3>
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

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>{t("faculties.code")}</TableHead>
						<TableHead>{t("faculties.name")}</TableHead>
						<TableHead>{t("faculties.departmentCount")}</TableHead>
						<TableHead>{t("faculties.actions")}</TableHead>
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
							<TableCell colSpan={5} className="text-center py-6 text-gray-500">
								{t("faculties.notFound")}
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
