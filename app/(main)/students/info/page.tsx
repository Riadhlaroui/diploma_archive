/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Check,
	Copy,
	Loader2,
	Trash2,
	UserRoundPen,
} from "lucide-react";
import pb from "@/lib/pocketbase";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentInfoPage = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const studentId = searchParams.get("stuId");

	const [copied, setCopied] = useState(false);

	const [student, setStudent] = useState<any>(null);
	const [documents, setDocuments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!studentId) return;

		const fetchStudent = async () => {
			try {
				const data = await pb.collection("Archive_students").getOne(studentId, {
					expand: "fieldId,majorId,specialtyId",
				});
				console.log("Fetched student data:", data);
				setStudent(data);

				const docs = await pb.collection("Archive_documents").getFullList({
					filter: `studentId = '${studentId}'`,
					expand: "fileId",
				});
				console.log("Fetched documents:", docs);
				setDocuments(docs);
			} catch (err) {
				console.error("Failed to fetch student info:", err);
				toast.error("Failed to fetch student info.");
			} finally {
				setLoading(false);
			}
		};

		fetchStudent();
	}, [studentId]);

	const handleEdit = () => {
		console.log("Edit student:", studentId);
	};

	const handleDelete = async () => {
		const confirmDelete = confirm(
			"Are you sure you want to delete this student?"
		);
		if (!confirmDelete) return;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader2 className="animate-spin w-6 h-6 text-gray-500" />
			</div>
		);
	}

	if (!student) {
		return (
			<div className="flex items-center justify-center h-screen text-gray-500">
				Student not found.
			</div>
		);
	}

	return (
		<div className="p-6 mx-auto w-full h-full">
			<button
				onClick={() => router.back()}
				className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white hover:text-black dark:hover:text-gray-300"
			>
				<ArrowLeft className="h-4 w-4" />
				Back
			</button>

			<div className="bg-white dark:bg-zinc-900 shadow rounded-xl p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-semibold">Student Profile</h2>
					<div className="flex gap-2">
						<Button onClick={handleEdit} variant="outline">
							<UserRoundPen className="w-4 h-4 mr-2" /> EDIT
						</Button>
						<Button onClick={handleDelete} variant="destructive">
							<Trash2 className="w-4 h-4 mr-2" /> DELETE
						</Button>
					</div>
				</div>

				<Separator className="my-4" />

				<Tabs defaultValue="info">
					<TabsList className="mb-4">
						<TabsTrigger value="info">Student Info</TabsTrigger>
						<TabsTrigger value="documents">Documents</TabsTrigger>
					</TabsList>

					<TabsContent value="info">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
							<div className="space-y-4">
								<div className="flex flex-col">
									<span className="text-xs mb-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ">
										Matricule
									</span>
									<div className="flex items-center gap-2">
										<span className="inline-flex  items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 shadow-sm ring-1 ring-gray-200/50">
											{student.matricule}
										</span>
										<button
											onClick={() => {
												navigator.clipboard.writeText(student.matricule);
												setCopied(true);
												setTimeout(() => setCopied(false), 1500);
											}}
											className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
											aria-label="Copy matricule"
										>
											{copied ? (
												<Check className="w-4 h-4 text-green-500" />
											) : (
												<Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
											)}
										</button>
									</div>
								</div>

								<div className="flex flex-col">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Name
									</span>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										{student.firstName} {student.lastName}
									</span>
								</div>

								<div className="flex flex-col">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Date of Birth
									</span>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										{new Date(student.dateOfBirth).toLocaleDateString()}
									</span>
								</div>

								<div className="flex flex-col">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Enrollment Year
									</span>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										{student.enrollmentYear}
									</span>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex flex-col">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Field
									</span>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										{student.expand?.fieldId?.name}
									</span>
								</div>

								<div className="flex flex-col">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Major
									</span>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										{student.expand?.majorId?.name}
									</span>
								</div>

								<div className="flex flex-col">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Specialty
									</span>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										{student.expand?.specialtyId?.name}
									</span>
								</div>

								<div className="flex flex-col">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Created
									</span>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										{new Date(student.created).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="documents">
						{documents.length === 0 ? (
							<p className="text-gray-500">No documents uploaded.</p>
						) : (
							<ul className="space-y-2">
								{documents.map((doc) => (
									<li
										key={doc.id}
										className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-md flex justify-between items-center"
									>
										<div>
											<p className="font-medium">
												{doc.expand?.fileId?.fileType}
											</p>
											<p className="text-sm text-gray-500">
												{doc.expand?.fileId?.file}
											</p>
										</div>
										<a
											href={pb.getFileUrl(
												doc.expand?.fileId,
												doc.expand?.fileId?.file
											)}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline text-sm"
										>
											View
										</a>
									</li>
								))}
							</ul>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default StudentInfoPage;
