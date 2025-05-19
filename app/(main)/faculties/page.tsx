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
import React, { useState } from "react";
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
import { FacultieList } from "@/app/src/services/facultieService";
import { toast } from "sonner";
import AddFacultyDialog from "@/components/AddFacultyDialog"; // Adjust path if necessary

const FacultiesList = () => {
	const [logs, setLogs] = useState<FacultieList[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [totalPages, setTotalPages] = useState(1);
	const [page, setPage] = useState(1);
	const [copiedId, setCopiedId] = useState("");
	const [showDialog, setShowDialog] = useState(false);

	const { t } = useTranslation();

	return (
		<div className="flex flex-col h-full mt-10 p-6 rounded-md shadow-lg">
			<div className="flex gap-2 mb-4 items-center">
				<h3 className="text-2xl font-semibold">{t("faculties.title")}</h3>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					onClick={() => {}}
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

			{error && (
				<div className="text-red-500 text-sm mb-4 text-center">{error}</div>
			)}

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
								className="hover:bg-gray-100 dark:hover:bg-zinc-800"
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
											onClick={() => console.log("Edit faculty")}
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => console.log("Delete faculty")}
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

			{/* AddFacultyDialog */}
			{showDialog && <AddFacultyDialog onClose={() => setShowDialog(false)} />}
		</div>
	);
};

export default FacultiesList;
