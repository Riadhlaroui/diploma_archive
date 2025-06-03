/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { fetchStudentDocuments } from "@/app/src/services/documentTypesServices";
import pb from "@/lib/pocketbase";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, Trash, Upload } from "lucide-react";
import DocumentViewer from "@/components/DocumentViewr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Student {
	id: string;
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	enrollmentYear: string;
	created: string;
	fieldId: string;
	majorId: string;
	specialtyId: string;
	expand?: {
		fieldId?: { name: string; departmentId: string };
		majorId?: { name: string };
		specialtyId?: { name: string };
	};
}

interface Document {
	id: string;
	typeId: string;
	studentId: string;
	expand?: {
		fileId?: any;
		typeId?: { name: string };
	};
	typeInfo?: {
		name: string;
	};
}

interface DocumentType {
	id: string;
	name: string;
}

interface AcademicHierarchy {
	facultyId: string;
	departmentId: string;
	fieldId: string;
	majorId: string;
	specialtyId: string;
}

const StudentUpdatePage = () => {
	const { t } = useTranslation();
	const searchParams = useSearchParams();
	const studentId = searchParams.get("stuId");
	const router = useRouter();

	const confirmationTitle = t("updateStudent.deleteDocumentTitle");
	const confirmationDescription = t("updateStudent.deleteDocumentDescription");

	const [student, setStudent] = useState<Student | null>(null);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
	const [loading, setLoading] = useState(true);

	const [faculties, setFaculties] = useState<any[]>([]);
	const [departments, setDepartments] = useState<any[]>([]);
	const [fields, setFields] = useState<any[]>([]);
	const [majors, setMajors] = useState<any[]>([]);
	const [specialties, setSpecialties] = useState<any[]>([]);

	const [academicHierarchy, setAcademicHierarchy] = useState<AcademicHierarchy>(
		{
			facultyId: "",
			departmentId: "",
			fieldId: "",
			majorId: "",
			specialtyId: "",
		}
	);

	const [pendingDocuments, setPendingDocuments] = useState<
		Array<{
			file: File;
			typeId: string;
		}>
	>([]);

	const [viewerOpen, setViewerOpen] = useState(false);
	const [viewerFile, setViewerFile] = useState<File | null>(null);
	const [viewerFileName, setViewerFileName] = useState("");

	const [selectedDocumentType, setSelectedDocumentType] = useState("");
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const [form, setForm] = useState({
		matricule: "",
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		enrollmentYear: "",
	});

	// ADDED: State for delete confirmation
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

	const fetchStudentData = useCallback(async () => {
		if (!studentId) return;
		try {
			setLoading(true);
			const [studentData, docs, docTypes] = await Promise.all([
				pb.collection("Archive_students").getOne(studentId, {
					expand:
						"fieldId,fieldId.departmentId,fieldId.departmentId.facultyId,majorId,specialtyId",
				}),
				fetchStudentDocuments(studentId),
				pb.collection("Document_types").getFullList(),
			]);

			setStudent({
				id: studentData.id,
				matricule: studentData.matricule,
				firstName: studentData.firstName,
				lastName: studentData.lastName,
				dateOfBirth: studentData.dateOfBirth,
				enrollmentYear: studentData.enrollmentYear,
				created: studentData.created,
				fieldId: studentData.fieldId,
				majorId: studentData.majorId,
				specialtyId: studentData.specialtyId,
				expand: studentData.expand,
			});
			setForm({
				matricule: studentData.matricule,
				firstName: studentData.firstName,
				lastName: studentData.lastName,
				dateOfBirth: new Date(studentData.dateOfBirth)
					.toISOString()
					.split("T")[0],
				enrollmentYear: studentData.enrollmentYear,
			});

			// Extract academic hierarchy from expanded data
			const facultyId =
				studentData.expand?.fieldId?.expand?.departmentId?.expand?.facultyId
					?.id || "";
			const departmentId =
				studentData.expand?.fieldId?.expand?.departmentId?.id || "";
			const fieldId = studentData.fieldId;
			const majorId = studentData.majorId;
			const specialtyId = studentData.specialtyId;

			setAcademicHierarchy({
				facultyId,
				departmentId,
				fieldId,
				majorId,
				specialtyId,
			});

			setDocuments(
				docs.map((doc: any) => ({
					id: doc.id,
					typeId: doc.typeId ?? "",
					studentId: doc.studentId ?? "",
					expand: doc.expand,
					typeInfo: doc.typeInfo,
				}))
			);

			setDocumentTypes(
				docTypes.map((dt: any) => ({
					id: dt.id,
					name: dt.name,
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

	// Fetch faculties on mount
	useEffect(() => {
		const fetchFaculties = async () => {
			try {
				const data = await pb.collection("Archive_faculties").getFullList();
				setFaculties(data);
			} catch (error) {
				console.error("Failed to fetch faculties:", error);
			}
		};
		fetchFaculties();
	}, []);

	// Fetch departments when faculty changes
	useEffect(() => {
		const fetchDepartments = async () => {
			if (!academicHierarchy.facultyId) {
				setDepartments([]);
				return;
			}
			try {
				const data = await pb.collection("Archive_departments").getFullList({
					filter: `facultyId="${academicHierarchy.facultyId}"`,
				});
				setDepartments(data);
			} catch (error) {
				console.error("Failed to fetch departments:", error);
			}
		};
		fetchDepartments();
	}, [academicHierarchy.facultyId]);

	// Fetch fields when department changes
	useEffect(() => {
		const fetchFields = async () => {
			if (!academicHierarchy.departmentId) {
				setFields([]);
				return;
			}
			try {
				const data = await pb.collection("Archive_fields").getFullList({
					filter: `departmentId="${academicHierarchy.departmentId}"`,
				});
				setFields(data);
			} catch (error) {
				console.error("Failed to fetch fields:", error);
			}
		};
		fetchFields();
	}, [academicHierarchy.departmentId]);

	// Fetch majors when field changes
	useEffect(() => {
		const fetchMajors = async () => {
			if (!academicHierarchy.fieldId) {
				setMajors([]);
				return;
			}
			try {
				const data = await pb.collection("Archive_majors").getFullList({
					filter: `fieldId="${academicHierarchy.fieldId}"`,
				});
				setMajors(data);
			} catch (error) {
				console.error("Failed to fetch majors:", error);
			}
		};
		fetchMajors();
	}, [academicHierarchy.fieldId]);

	// Fetch specialties when major changes
	useEffect(() => {
		const fetchSpecialties = async () => {
			if (!academicHierarchy.majorId) {
				setSpecialties([]);
				return;
			}
			try {
				const data = await pb.collection("Archive_specialties").getFullList({
					filter: `majorId="${academicHierarchy.majorId}"`,
				});
				setSpecialties(data);
			} catch (error) {
				console.error("Failed to fetch specialties:", error);
			}
		};
		fetchSpecialties();
	}, [academicHierarchy.majorId]);

	const fetchFileFromUrl = async (
		url: string,
		fileName: string
	): Promise<File> => {
		const response = await fetch(url);
		const blob = await response.blob();
		return new File([blob], fileName, { type: blob.type });
	};

	const handleViewDocument = async (fileData: any, fileName: string) => {
		try {
			const fileUrl = pb.files.getUrl(fileData, fileName);
			const file = await fetchFileFromUrl(fileUrl, fileName);
			setViewerFile(file);
			setViewerFileName(fileName);
			setViewerOpen(true);
		} catch (err) {
			console.error("Failed to load file:", err);
			toast.error("Unable to preview file.");
		}
	};

	// MODIFIED: Delete with confirmation dialog
	const handleDeleteDocument = async () => {
		if (!documentToDelete) return;

		try {
			await pb.collection("Archive_documents").delete(documentToDelete);
			toast.success("Document deleted successfully");
			fetchStudentData();
		} catch (err) {
			console.error("Failed to delete document:", err);
			toast.error("Failed to delete document");
		} finally {
			// Reset deletion state
			setDocumentToDelete(null);
			setShowDeleteConfirmation(false);
		}
	};

	// ADDED: Function to initiate deletion process
	const promptDeleteDocument = (documentId: string) => {
		setDocumentToDelete(documentId);
		setShowDeleteConfirmation(true);
	};

	const handleUpdateStudent = async () => {
		if (!studentId) return;

		setIsUploading(true);
		try {
			// Update student record
			const updateData = {
				...form,
				fieldId: academicHierarchy.fieldId,
				majorId: academicHierarchy.majorId,
				specialtyId: academicHierarchy.specialtyId,
			};

			await pb.collection("Archive_students").update(studentId, updateData);

			// Upload pending documents
			for (const doc of pendingDocuments) {
				const formData = new FormData();
				formData.append("file", doc.file);
				formData.append("typeId", doc.typeId);

				const fileRecord = await pb
					.collection("Archive_files")
					.create(formData);
				await pb.collection("Archive_documents").create({
					studentId: studentId,
					fileId: fileRecord.id,
					typeId: doc.typeId,
				});
			}

			toast.success("All changes saved successfully");
			setPendingDocuments([]);
			fetchStudentData();
		} catch (err) {
			console.error("Failed to update:", err);
			toast.error(
				`Failed to save changes: ${
					err instanceof Error ? err.message : "Unknown error"
				}`
			);
		} finally {
			setIsUploading(false);
		}
	};

	const handleUploadDocument = () => {
		if (!selectedDocumentType || !uploadFile || !studentId) {
			toast.error("Please select a document type and file");
			return;
		}

		setPendingDocuments((prev) => [
			...prev,
			{
				file: uploadFile,
				typeId: selectedDocumentType,
			},
		]);

		toast.success("Document added to pending changes");
		setUploadFile(null);
		setSelectedDocumentType("");
	};

	const handleAcademicHierarchyChange = (
		level: keyof AcademicHierarchy,
		value: string
	) => {
		setAcademicHierarchy((prev) => ({
			...prev,
			[level]: value,
			// Reset downstream selections
			...(level === "facultyId" && {
				departmentId: "",
				fieldId: "",
				majorId: "",
				specialtyId: "",
			}),
			...(level === "departmentId" && {
				fieldId: "",
				majorId: "",
				specialtyId: "",
			}),
			...(level === "fieldId" && {
				majorId: "",
				specialtyId: "",
			}),
			...(level === "majorId" && {
				specialtyId: "",
			}),
		}));
	};

	if (loading) {
		return (
			<div className="w-full min-h-screen p-4">
				<Skeleton className="w-full h-8 mb-4" />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="space-y-4">
						{[...Array(8)].map((_, i) => (
							<Skeleton key={i} className="w-full h-10" />
						))}
					</div>
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="w-full h-32" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!student) {
		return (
			<div className="w-full min-h-screen flex items-center justify-center">
				<p>{t("updateStudent.notFound")}</p>
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen p-4" dir={t("common.dir")}>
			<ConfirmDialog
				open={showDeleteConfirmation}
				onClose={() => setShowDeleteConfirmation(false)}
				onConfirm={handleDeleteDocument}
				title={confirmationTitle}
				description={confirmationDescription}
			/>

			<button
				onClick={() => router.back()}
				className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-gray-100 hover:underline transition-colors hover:cursor-pointer"
			>
				<ArrowLeft className="h-4 w-4" />
				{t("common.back")}
			</button>
			<h2 className="text-xl font-bold mb-4">{t("updateStudent.title")}</h2>
			<div className="flex flex-col lg:flex-row gap-8">
				{/* Left: Student Info */}
				<div className="w-full lg:w-1/2">
					<div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6 bg-white dark:bg-gray-900">
						<h2 className="text-base font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
							{t("updateStudent.academicInfo")}:
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Faculty */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									{t("updateStudent.faculty")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<Select
									value={academicHierarchy.facultyId}
									onValueChange={(value) =>
										handleAcademicHierarchyChange("facultyId", value)
									}
								>
									<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400">
										<SelectValue
											placeholder={t("updateStudent.selectFaculty")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>{t("updateStudent.faculty")}</SelectLabel>
											{faculties.map((f) => (
												<SelectItem key={f.id} value={f.id}>
													{f.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							{/* Department */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									{t("updateStudent.department")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<Select
									value={academicHierarchy.departmentId}
									onValueChange={(value) =>
										handleAcademicHierarchyChange("departmentId", value)
									}
									disabled={!academicHierarchy.facultyId}
								>
									<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
										<SelectValue
											placeholder={t("updateStudent.selectDepartment")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>{t("updateStudent.department")}</SelectLabel>
											{departments.map((d) => (
												<SelectItem key={d.id} value={d.id}>
													{d.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							{/* Fields */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									{t("updateStudent.field")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<Select
									value={academicHierarchy.fieldId}
									onValueChange={(value) =>
										handleAcademicHierarchyChange("fieldId", value)
									}
									disabled={!academicHierarchy.departmentId}
								>
									<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
										<SelectValue placeholder={t("updateStudent.selectField")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>{t("updateStudent.field")}</SelectLabel>
											{fields.map((f) => (
												<SelectItem key={f.id} value={f.id}>
													{f.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							{/* Major */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									{t("updateStudent.major")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<Select
									value={academicHierarchy.majorId}
									onValueChange={(value) =>
										handleAcademicHierarchyChange("majorId", value)
									}
									disabled={!academicHierarchy.fieldId}
								>
									<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
										<SelectValue placeholder={t("updateStudent.selectMajor")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>{t("updateStudent.major")}</SelectLabel>
											{majors.map((m) => (
												<SelectItem key={m.id} value={m.id}>
													{m.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Specialty */}
						<div className="space-y-1">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								{t("updateStudent.specialty")}{" "}
								<span className="text-red-500">*</span>
							</label>
							<Select
								value={academicHierarchy.specialtyId}
								onValueChange={(value) =>
									handleAcademicHierarchyChange("specialtyId", value)
								}
								disabled={!academicHierarchy.majorId}
							>
								<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white">
									<SelectValue
										placeholder={t("updateStudent.selectSpecialty")}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>{t("updateStudent.specialty")}</SelectLabel>
										{specialties.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<h2 className="text-base font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mt-6">
							{t("updateStudent.personalInfo")}:
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label>{t("updateStudent.matricule")}</Label>
								<Input
									value={form.matricule}
									onChange={(e) =>
										setForm({ ...form, matricule: e.target.value })
									}
								/>
							</div>
							<div className="space-y-1">
								<Label>{t("updateStudent.firstName")}</Label>
								<Input
									value={form.firstName}
									onChange={(e) =>
										setForm({ ...form, firstName: e.target.value })
									}
								/>
							</div>
							<div className="space-y-1">
								<Label>{t("updateStudent.lastName")}</Label>
								<Input
									value={form.lastName}
									onChange={(e) =>
										setForm({ ...form, lastName: e.target.value })
									}
								/>
							</div>
							<div className="space-y-1">
								<Label>{t("updateStudent.dateOfBirth")}</Label>
								<Input
									type="date"
									value={form.dateOfBirth}
									onChange={(e) =>
										setForm({ ...form, dateOfBirth: e.target.value })
									}
								/>
							</div>
							<div className="space-y-1">
								<Label>{t("updateStudent.enrollmentYear")}</Label>
								<Input
									value={form.enrollmentYear}
									onChange={(e) =>
										setForm({ ...form, enrollmentYear: e.target.value })
									}
								/>
							</div>
						</div>

						<Button
							onClick={handleUpdateStudent}
							className="mt-4 w-full"
							disabled={isUploading}
						>
							{isUploading
								? t("updateStudent.savingChanges")
								: t("updateStudent.updateButton")}
						</Button>
					</div>
				</div>

				{/* Right: Documents */}
				<div className="w-full lg:w-1/2">
					<div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6 bg-white dark:bg-gray-900">
						<h3 className="text-lg font-semibold mb-4">
							{t("updateStudent.studentDocuments")}
						</h3>

						{/* Document Upload Section */}
						<div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
							<h4 className="text-sm font-medium mb-3">
								{t("updateStudent.uploadNewDocument")}
							</h4>
							<div className="space-y-3">
								<Select
									value={selectedDocumentType}
									onValueChange={setSelectedDocumentType}
								>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={t("updateStudent.selectDocumentType")}
										/>
									</SelectTrigger>
									<SelectContent>
										{documentTypes.map((type) => (
											<SelectItem key={type.id} value={type.id}>
												{type.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<div className="grid w-full max-w-sm items-center gap-1.5">
									<Label htmlFor="document-upload">
										{t("updateStudent.documentFile")}
									</Label>
									<Input
										id="document-upload"
										type="file"
										onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
										accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
									/>
								</div>

								<Button
									onClick={handleUploadDocument}
									disabled={!selectedDocumentType || !uploadFile}
									className="w-full"
								>
									<Upload className="h-4 w-4 mr-2" />
									{t("updateStudent.addDocumentToPending")}
								</Button>

								{/* Pending Documents List */}
								{pendingDocuments.length > 0 && (
									<div className="mt-4">
										<h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
											{t("updateStudent.pendingDocumentsNote")}
										</h4>
										<ul className="space-y-2">
											{pendingDocuments.map((doc, index) => (
												<li
													key={index}
													className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded"
												>
													<div className="flex items-center gap-2">
														<span className="text-sm font-medium">
															{doc.file.name}
														</span>
														<span className="text-xs text-gray-500 dark:text-gray-400">
															(
															{documentTypes.find((t) => t.id === doc.typeId)
																?.name || t("updateStudent.unknownType")}
															)
														</span>
													</div>
													<button
														onClick={() => {
															setPendingDocuments((prev) =>
																prev.filter((_, i) => i !== index)
															);
															toast.success(
																t("updateStudent.documentRemovedPending")
															);
														}}
														className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
													>
														<Trash className="h-4 w-4" />
													</button>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>

						{/* Existing Documents List */}
						<div>
							<h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
								{t("updateStudent.existingDocuments")}
							</h4>
							{documents.length === 0 ? (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{t("updateStudent.noDocuments")}
								</p>
							) : (
								<ul className="grid gap-3">
									{documents.map((doc) => {
										const fileData = Array.isArray(doc.expand?.fileId)
											? doc.expand.fileId[0]
											: doc.expand?.fileId;

										if (!fileData) return null;

										const fileName = Array.isArray(fileData?.file)
											? fileData.file[0]
											: fileData?.file || t("updateStudent.noFilename");

										const typeName =
											doc.typeInfo?.name ||
											fileData?.expand?.typeId?.name ||
											t("updateStudent.unknownType");

										return (
											<li
												key={doc.id}
												className="group p-4 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex justify-between items-center"
											>
												<div className="flex items-center gap-3 flex-1 min-w-0">
													<div className="min-w-0">
														<p className="font-medium text-gray-500 dark:text-gray-400 truncate">
															{fileName}
														</p>
														<p className="text-sm text-gray-900 dark:text-gray-100 truncate">
															{typeName}
														</p>
													</div>
												</div>
												<div className="flex gap-2">
													<button
														onClick={() =>
															handleViewDocument(fileData, fileName)
														}
														className="flex-shrink-0 flex items-center gap-1 text-sm font-medium hover:bg-gray-200 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md dark:hover:bg-blue-900/30 hover:cursor-pointer"
													>
														<Eye className="h-4 w-4" />
														{t("common.view")}
													</button>
													<button
														onClick={() => promptDeleteDocument(doc.id)}
														className="flex-shrink-0 flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 transition-colors px-3 py-1.5 rounded-md dark:hover:bg-red-900/30"
													>
														<Trash className="h-4 w-4" />
														{t("common.delete")}
													</button>
												</div>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					</div>
				</div>
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

export default StudentUpdatePage;
