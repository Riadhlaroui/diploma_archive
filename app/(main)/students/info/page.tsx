/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, JSX } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Check,
	Copy,
	FileText,
	FolderOpen,
	ImageIcon,
	Loader2,
	Trash2,
	UserRound,
	File,
	Eye,
} from "lucide-react";
import pb from "@/lib/pocketbase";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentViewer from "@/components/DocumentViewr";
import { fetchStudentDocuments } from "@/app/src/services/documentTypesServices";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Student {
	id: string;
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	enrollmentYear: string;
	graduationYear: string;
	created: string;
	expand?: {
		fieldId?: { name: string };
		majorId?: { name: string };
		specialtyId?: { name: string };
	};
}

interface Document {
	id: string;
	typeId: string;
	studentId: string;
	fileId: string; // ADDED
	expand?: {
		fileId?: any;
		typeId?: { name: string };
	};
	typeInfo?: {
		name: string;
	};
}

const StudentInfoPage = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const studentId = searchParams.get("stuId");

	const [copied, setCopied] = useState(false);
	const [student, setStudent] = useState<Student | null>(null);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewerOpen, setViewerOpen] = useState(false);
	const [viewerFile, setViewerFile] = useState<File | null>(null);
	const [viewerFileName, setViewerFileName] = useState("");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	//const [updateDialog, setUpdateDialog] = useState(false);

	const { t } = useTranslation();

	const fetchFileFromUrl = useCallback(
		async (url: string, fileName: string): Promise<File> => {
			const response = await fetch(url);
			const blob = await response.blob();

			try {
				if (typeof window !== "undefined" && typeof File !== "undefined") {
					return new window.File([blob], fileName, { type: blob.type });
				} else {
					const fallback: any = blob;
					fallback.name = fileName;
					return fallback;
				}
			} catch {
				const fallback: any = blob;
				fallback.name = fileName;
				return fallback;
			}
		},
		[]
	);

	const fetchStudentData = useCallback(async () => {
		if (!studentId) return;

		try {
			const [studentData, docs] = await Promise.all([
				pb.collection("Archive_students").getOne(studentId, {
					expand: "fieldId,majorId,specialtyId",
					requestOptions: {
						signal: null,
					},
				}),
				fetchStudentDocuments(studentId),
			]);

			setStudent({
				id: studentData.id,
				matricule: studentData.matricule,
				firstName: studentData.firstName,
				lastName: studentData.lastName,
				dateOfBirth: studentData.dateOfBirth,
				enrollmentYear: studentData.enrollmentYear,
				graduationYear: studentData.graduationYear,
				created: studentData.created,
				expand: studentData.expand,
			});

			// FIXED: Store fileId in document state
			setDocuments(
				docs.map((doc: any) => ({
					id: doc.id,
					typeId: doc.typeId ?? "",
					studentId: doc.studentId ?? "",
					fileId: doc.fileId ?? "", // ADDED
					expand: doc.expand,
					typeInfo: doc.typeInfo,
				}))
			);
		} catch (err) {
			console.error("Failed to fetch student or document info:", err);
		} finally {
			setLoading(false);
		}
	}, [studentId]);

	useEffect(() => {
		fetchStudentData();
	}, [fetchStudentData]);

	const getFileIcon = (fileName: string) => {
		const extension = fileName.split(".").pop()?.toLowerCase();
		switch (extension) {
			case "pdf":
				return <FileText className="h-5 w-5 text-red-500" />;
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
			case "svg":
			case "webp":
				return <ImageIcon className="h-5 w-5 text-blue-500" />;
			case "doc":
			case "docx":
			case "odt":
				return <FileText className="h-5 w-5 text-blue-600" />;
			case "xls":
			case "xlsx":
			case "csv":
				return <FileText className="h-5 w-5 text-green-600" />;
			default:
				return <File className="h-5 w-5 text-gray-500" />;
		}
	};

	const getFileTypeColor = (fileType: string) => {
		const type = fileType?.toLowerCase();
		if (type?.includes("pdf")) return "bg-red-100 dark:bg-red-900/30";
		if (type?.includes("word")) return "bg-blue-100 dark:bg-blue-900/30";
		if (type?.includes("excel")) return "bg-green-100 dark:bg-green-900/30";
		if (type?.includes("image")) return "bg-purple-100 dark:bg-purple-900/30";
		return "bg-gray-100 dark:bg-gray-900/30";
	};

	const handleEdit = () => {
		if (!student) return;
		router.push(`/students/update?stuId=${student.id}`);
	};

	const handleDelete = async () => {
		if (!student) return;

		try {
			// Delete all documents and associated files
			for (const doc of documents) {
				try {
					if (doc.fileId) {
						await pb.collection("Archive_files").delete(doc.fileId);
					}
					await pb.collection("Archive_documents").delete(doc.id);
				} catch (err) {
					console.warn("Failed to delete document or file:", err);
				}
			}

			// Delete the student record
			await pb.collection("Archive_students").delete(student.id);

			toast.success(t("students.deleteSuccess"));
			router.push("/students");
		} catch (err) {
			console.error("Failed to delete student:", err);
			toast.error(t("students.deleteFailed"));
		} finally {
			setIsDeleteDialogOpen(false);
		}
	};

	const handleViewDocument = async (fileData: any, fileName: string) => {
		try {
			const fileUrl = pb.files.getURL(fileData, fileName);
			const file = await fetchFileFromUrl(fileUrl, fileName);
			setViewerFile(file);
			setViewerFileName(fileName);
			setViewerOpen(true);
		} catch (err) {
			console.error("Failed to load file:", err);
			toast.error("Unable to preview file.");
		}
	};

	const handleCopyMatricule = () => {
		if (!student) return;
		navigator.clipboard.writeText(student.matricule);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
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
				{t("students.notFound")}
			</div>
		);
	}

	return (
		<div className="p-4 md:p-6 mx-auto w-full">
			<ConfirmDialog
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDelete}
				title={t("students.confirmDeleteTitle")}
				description={t("students.confirmDeleteDescription", {
					name: student ? `${student.firstName} ${student.lastName}` : "",
				})}
			/>
			<button
				onClick={() => router.back()}
				className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-gray-100 hover:underline transition-colors hover:cursor-pointer"
			>
				<ArrowLeft className="h-4 w-4" />
				{t("common.back")}
			</button>

			<div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-4 md:p-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
					<h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
						{t("students.profile")}
					</h2>
					<div className="flex gap-2 w-full md:w-auto">
						<Button
							onClick={handleEdit}
							variant="outline"
							className="flex-1 md:flex-none"
						>
							<UserRound className="w-4 h-4 mr-2" />
							{t("common.edit")}
						</Button>
						<Button
							onClick={() => setIsDeleteDialogOpen(true)}
							variant="destructive"
							className="flex-1 md:flex-none"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							{t("common.delete")}
						</Button>
					</div>
				</div>

				<Separator className="my-4" />

				<Tabs defaultValue="info">
					<TabsList className="mb-4">
						<TabsTrigger value="info">{t("students.info")}</TabsTrigger>
						<TabsTrigger value="documents">
							{t("students.documents")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="info">
						<StudentInfoSection
							student={student}
							copied={copied}
							onCopyMatricule={handleCopyMatricule}
						/>
					</TabsContent>

					<TabsContent value="documents">
						<DocumentsSection
							documents={documents}
							getFileIcon={getFileIcon}
							getFileTypeColor={getFileTypeColor}
							onViewDocument={handleViewDocument}
						/>
					</TabsContent>
				</Tabs>
			</div>

			{viewerOpen && viewerFile && (
				<DocumentViewer
					isOpen={viewerOpen}
					onClose={() => setViewerOpen(false)}
					file={viewerFile}
					fileName={viewerFileName}
				/>
			)}
		</div>
	);
};

interface StudentInfoSectionProps {
	student: Student;
	copied: boolean;
	onCopyMatricule: () => void;
}

const StudentInfoSection: React.FC<StudentInfoSectionProps> = ({
	student,
	copied,
	onCopyMatricule,
}) => {
	const { t } = useTranslation();

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 dark:bg-gray-800 rounded-lg">
			<div className="space-y-4">
				<InfoField
					label={t("students.matricule")}
					value={student.matricule}
					isCopyable
					copied={copied}
					onCopy={onCopyMatricule}
				/>
				<InfoField
					label={t("students.name")}
					value={`${student.firstName} ${student.lastName}`}
				/>
				<InfoField
					label={t("students.dateOfBirth")}
					value={new Date(student.dateOfBirth).toLocaleDateString()}
				/>
				<InfoField
					label={t("students.enrollmentYear")}
					value={student.enrollmentYear}
				/>

				<InfoField
					label={t("students.graduationYear")}
					value={student.graduationYear || "N/A"}
				/>
			</div>
			<div className="space-y-4">
				<InfoField
					label={t("students.field")}
					value={student.expand?.fieldId?.name || "N/A"}
				/>
				<InfoField
					label={t("students.major")}
					value={student.expand?.majorId?.name || "N/A"}
				/>
				<InfoField
					label={t("students.specialty")}
					value={student.expand?.specialtyId?.name || "N/A"}
				/>
				<InfoField
					label={t("students.createdAt")}
					value={new Date(student.created).toLocaleDateString()}
				/>
			</div>
		</div>
	);
};

interface InfoFieldProps {
	label: string;
	value: string;
	isCopyable?: boolean;
	copied?: boolean;
	onCopy?: () => void;
}

const InfoField: React.FC<InfoFieldProps> = ({
	label,
	value,
	isCopyable = false,
	copied = false,
	onCopy,
}) => (
	<div className="flex flex-col">
		<span className="text-xs mb-1 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
			{label}:
		</span>
		{isCopyable ? (
			<div className="flex items-center gap-2">
				<span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
					{value}
				</span>
				<button
					onClick={onCopy}
					className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
					aria-label={`Copy ${label.toLowerCase()}`}
				>
					{copied ? (
						<Check className="w-4 h-4 text-green-500" />
					) : (
						<Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
					)}
				</button>
			</div>
		) : (
			<span className="text-lg font-semibold text-gray-900 dark:text-white">
				{value}
			</span>
		)}
	</div>
);

interface DocumentsSectionProps {
	documents: Document[];
	getFileIcon: (fileName: string) => JSX.Element;
	getFileTypeColor: (fileType: string) => string;
	onViewDocument: (fileData: any, fileName: string) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
	documents,
	getFileIcon,
	getFileTypeColor,
	onViewDocument,
}) => {
	const { t } = useTranslation();

	if (documents.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<FolderOpen className="h-10 w-10 text-gray-400 mb-3" />
				<p className="text-gray-500">{t("students.noDocuments")}</p>
				<p className="text-sm text-gray-400 mt-1">
					{t("students.uploadToGetStarted")}
				</p>
			</div>
		);
	}

	return (
		<ul className="grid gap-3">
			{documents.map((doc) => {
				const fileData = Array.isArray(doc.expand?.fileId)
					? doc.expand.fileId[0]
					: doc.expand?.fileId;

				const fileName = Array.isArray(fileData?.file)
					? fileData.file[0]
					: fileData?.file || "No filename";

				const typeName =
					doc.typeInfo?.name || fileData?.expand?.typeId?.name || "Unknown";

				return (
					<li
						key={doc.id}
						className="group p-4 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex justify-between items-center"
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div
								className={`p-2 rounded-lg ${getFileTypeColor(
									fileName.split(".").pop()?.toLowerCase() || ""
								)}`}
							>
								{getFileIcon(fileName)}
							</div>
							<div className="min-w-0">
								<p className="font-medium text-gray-500 dark:text-gray-400 truncate">
									{fileName}
								</p>
								<p className="text-sm text-gray-900 dark:text-gray-100 truncate">
									{typeName}
								</p>
							</div>
						</div>
						<button
							onClick={() => onViewDocument(fileData, fileName)}
							className="flex-shrink-0 flex items-center gap-1 text-sm font-medium hover:bg-gray-200 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md dark:hover:bg-blue-900/30 hover:cursor-pointer"
						>
							<Eye className="h-4 w-4" />
							{t("common.view")}
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export default StudentInfoPage;
