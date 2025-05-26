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

import { useTranslation } from "react-i18next";

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
import React, { useState } from "react";

const StudentPage = () => {
	const { t } = useTranslation();

	const [loading, setLoading] = useState(true);
	const [students, setStudents] = useState<any[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [copiedId, setCopiedId] = useState("");

	return (
		<div className="p-6 space-y-6">
			<div className="flex gap-2 mb-4 items-center">
				<h3 className="text-2xl font-semibold">Students</h3>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					disabled={loading}
				>
					{loading ? (
						<Loader2 className="animate-spin text-black dark:text-white" />
					) : (
						<RefreshCcw className="text-black dark:text-white" />
					)}
				</Button>
				<Button className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer">
					<SquarePlus className="text-black" />
				</Button>
			</div>

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead>Matricule</TableHead>
						<TableHead>First Name</TableHead>
						<TableHead>Last Name</TableHead>
						<TableHead>Date Of Birth</TableHead>
						<TableHead>Major</TableHead>
						<TableHead>Field</TableHead>
						<TableHead>Enrollment Year</TableHead>
						<TableHead>Specialty</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={8} className="text-center py-6">
								<Loader2 className="mx-auto animate-spin text-gray-500" />
								<span className="text-sm text-gray-500 mt-2 block">
									{t("loading")}
								</span>
							</TableCell>
						</TableRow>
					) : students.length > 0 ? (
						students.map((student) => (
							<TableRow
								key={student.id}
								className="hover:bg-gray-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
							>
								<TableCell>
									<span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{student.matricule}
										{copiedId === student.matricule ? (
											<Check size={14} className="text-green-600" />
										) : (
											<button
												onClick={() => {
													navigator.clipboard.writeText(student.matricule);
													setCopiedId(student.matricule);
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
								<TableCell>{student.firstName}</TableCell>
								<TableCell>{student.lastName}</TableCell>
								<TableCell>{student.dateOfBirth}</TableCell>
								<TableCell>{student.major}</TableCell>
								<TableCell>{student.field}</TableCell>
								<TableCell>{student.enrollmentYear}</TableCell>
								<TableCell>{student.specialtyId}</TableCell>
								<TableCell>
									{new Date(student.created).toLocaleDateString()}
								</TableCell>

								<TableCell>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											className="hover:cursor-pointer"
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
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
							<TableCell colSpan={8} className="text-center py-6 text-gray-500">
								Studens not found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={8} className="text-center py-3">
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
	);
};

export default StudentPage;
