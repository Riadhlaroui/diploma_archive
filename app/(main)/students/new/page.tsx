/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type React from "react";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

import pb from "@/lib/pocketbase";
import { toast } from "sonner";
import { createStudentWithDocuments } from "@/app/src/services/studentService";
import DocumentUploadDialog from "@/components/DocumentUploadDialog";
import { ArrowLeft, Upload, X, FileText, ImageIcon, File } from "lucide-react";
import { useRouter } from "next/navigation";
import DocumentViewer from "@/components/DocumentViewr";

const CreateStudentPage = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const [openDialog, setOpenDialog] = useState(false);

	const [faculties, setFaculties] = useState<any[]>([]);
	const [departments, setDepartments] = useState<any[]>([]);
	const [fields, setFields] = useState<any[]>([]);
	const [majors, setMajors] = useState<any[]>([]);
	const [specialties, setSpecialties] = useState<any[]>([]);

	const [selectedField, setSelectedField] = useState<string>("");
	const [selectedMajor, setSelectedMajor] = useState<string>("");

	const [selectedFaculty, setSelectedFaculty] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState("");

	const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);

	const [documents, setDocuments] = useState<
		{ file: File; typeId: string; typeName: string }[]
	>([]);

	const [form, setForm] = useState({
		matricule: "",
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		enrollmentYear: "",
		specialtyId: "",
		fieldId: "",
		majorId: "",
		file: null as File | null,
	});

	const [viewingDocument, setViewingDocument] = useState<{
		file: File;
		fileName: string;
	} | null>(null);

	useEffect(() => {
		pb.collection("Archive_faculties")
			.getFullList()
			.then((data) => setFaculties(data));
	}, []);

	// Get departments by faculty
	useEffect(() => {
		if (selectedFaculty) {
			pb.collection("Archive_departments")
				.getFullList({ filter: `facultyId="${selectedFaculty}"` })
				.then(setDepartments);

			// Reset downstream selections
			setSelectedDepartment("");
			setSpecialties([]);
			setForm((prev) => ({ ...prev, specialtyId: "", field: "", major: "" }));
			setSelectedSpecialty(null);
		} else {
			setDepartments([]);
			setSelectedDepartment("");
			setFields([]);
			setMajors([]);
			setSpecialties([]);
			setSelectedField("");
			setSelectedMajor("");
			setSelectedSpecialty(null);
			setForm((prev) => ({
				...prev,
				specialtyId: "",
				field: "",
				major: "",
			}));
		}
	}, [selectedFaculty]);

	// Get fields by department
	useEffect(() => {
		if (selectedDepartment) {
			pb.collection("Archive_fields")
				.getFullList({ filter: `departmentId="${selectedDepartment}"` })
				.then(setFields);

			setSelectedField("");
			setMajors([]);
			setSpecialties([]);
			setSelectedSpecialty(null);
			setForm((prev) => ({ ...prev, field: "", major: "", specialtyId: "" }));
		} else {
			setFields([]);
			setSelectedField("");
			setMajors([]);
			setSpecialties([]);
			setSelectedMajor("");
			setSelectedSpecialty(null);
			setForm((prev) => ({ ...prev, field: "", major: "", specialtyId: "" }));
		}
	}, [selectedDepartment]);

	// Get majors by field
	useEffect(() => {
		if (selectedField) {
			pb.collection("Archive_majors")
				.getFullList({ filter: `fieldId="${selectedField}"` })
				.then(setMajors);

			setSelectedMajor("");
			setSpecialties([]);
			setSelectedSpecialty(null);
			setForm((prev) => ({ ...prev, major: "", specialtyId: "" }));
		} else {
			setMajors([]);
			setSelectedMajor("");
			setSpecialties([]);
			setSelectedSpecialty(null);
			setForm((prev) => ({ ...prev, major: "", specialtyId: "" }));
		}
	}, [selectedField]);

	// Get specialties by major
	useEffect(() => {
		if (selectedMajor) {
			pb.collection("Archive_specialties")
				.getFullList({ filter: `majorId="${selectedMajor}"` })
				.then(setSpecialties);

			setSelectedSpecialty(null);
			setForm((prev) => ({ ...prev, specialtyId: "" }));
		} else {
			setSpecialties([]);
			setSelectedSpecialty(null);
			setForm((prev) => ({ ...prev, specialtyId: "" }));
		}
	}, [selectedMajor]);

	const handleSpecialtyChange = (value: string) => {
		const spec = specialties.find((s) => s.id === value);
		if (spec) {
			setForm((prev) => ({
				...prev,
				specialtyId: spec.id,
				majorId: prev.majorId || spec.major || "",
			}));

			setSelectedSpecialty(spec);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleCreate = async () => {
		const requiredFields = [
			"matricule",
			"firstName",
			"lastName",
			"dateOfBirth",
			"enrollmentYear",
			"specialtyId",
			"fieldId",
			"majorId",
		];

		const missingField = requiredFields.find(
			(key) => !form[key as keyof typeof form]
		);
		if (missingField) {
			toast.error(t("students.requiredField", { field: missingField }));
			return;
		}

		if (documents.length === 0) {
			toast.error(t("students.noDocuments"));
			return;
		}

		const dob = new Date(form.dateOfBirth);
		if (isNaN(dob.getTime())) {
			toast.error(t("students.invalidDOB"));
			return;
		}
		if (dob > new Date()) {
			toast.error(t("students.futureDOB"));
			return;
		}

		const year = Number.parseInt(form.enrollmentYear);
		const currentYear = new Date().getFullYear();
		if (
			!form.enrollmentYear ||
			isNaN(year) ||
			year < 1900 ||
			year > currentYear
		) {
			toast.error(t("students.invalidEnrollmentYear", { year: currentYear }));
			return;
		}

		try {
			const result = await createStudentWithDocuments(
				form,
				documents.map(({ file, typeId }) => ({ file, fileType: typeId }))
			);

			if (result?.error) {
				toast.error(
					<div className="flex items-center gap-2">
						<div>
							<div className="font-semibold text-[15px]">
								{t("students.exists")}
							</div>
							<div className="text-sm">{t("students.chooseDifferent")}</div>
						</div>
					</div>
				);
				return;
			}

			toast.success(t("students.created"));

			setForm({
				matricule: "",
				firstName: "",
				lastName: "",
				dateOfBirth: "",
				enrollmentYear: "",
				specialtyId: "",
				fieldId: "",
				majorId: "",
				file: null,
			});
			setSelectedFaculty("");
			setSelectedDepartment("");
			setSelectedSpecialty(null);
			setDepartments([]);
			setSpecialties([]);
			setDocuments([]);
		} catch (error: any) {
			console.error("Create student error:", error);
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold text-[15px]">
							{t("students.creationError")}
						</div>
					</div>
				</div>
			);
		}
	};

	const getFileIcon = (fileName: string) => {
		const extension = fileName.split(".").pop()?.toLowerCase();
		if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
			return <ImageIcon className="w-4 h-4 text-gray-500" />;
		} else if (["pdf"].includes(extension || "")) {
			return <FileText className="w-4 h-4 text-gray-500" />;
		} else {
			return <File className="w-4 h-4 text-gray-500" />;
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (
			Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
		);
	};

	return (
		<>
			<div className="min-h-full  bg-gray-100 dark:bg-gray-900 p-4">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<button
							onClick={() => router.back()}
							className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							<span>{t("addStudent.back")}</span>
						</button>
						<h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
							{t("addStudent.title")}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{t("addStudent.description")}
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Form */}
						<div className="lg:col-span-2">
							<div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-6">
								<form
									onSubmit={(e) => {
										e.preventDefault();
										handleCreate();
									}}
									className="space-y-6"
								>
									{/* Academic Information Section */}
									<div className="space-y-4">
										<h2 className="text-base font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
											{t("addStudent.academicInfo")}
										</h2>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{/* Faculty */}
											<div className="space-y-1">
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													{t("addStudent.faculty")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<Select
													value={selectedFaculty}
													onValueChange={setSelectedFaculty}
												>
													<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400">
														<SelectValue
															placeholder={t("addStudent.selectFaculty")}
														/>
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>
																{t("addStudent.faculty")}
															</SelectLabel>
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
													{t("addStudent.department")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<Select
													value={selectedDepartment}
													onValueChange={setSelectedDepartment}
													disabled={!selectedFaculty}
												>
													<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
														<SelectValue
															placeholder={t("addStudent.selectDepartment")}
														/>
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>
																{t("addStudent.department")}
															</SelectLabel>
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
													{t("addStudent.field")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<Select
													value={selectedField}
													onValueChange={(value) => {
														setSelectedField(value);
														const selected = fields.find((f) => f.id === value);
														setForm((prev) => ({
															...prev,
															fieldId: value,
														}));
													}}
													disabled={!selectedDepartment}
												>
													<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
														<SelectValue
															placeholder={t("addStudent.selectField")}
														/>
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>{t("addStudent.field")}</SelectLabel>
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
													{t("addStudent.major")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<Select
													value={selectedMajor}
													onValueChange={(value) => {
														setSelectedMajor(value);
														const selected = majors.find((m) => m.id === value);
														setForm((prev) => ({
															...prev,
															majorId: value,
														}));
													}}
													disabled={!selectedField}
												>
													<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
														<SelectValue
															placeholder={t("addStudent.selectMajor")}
														/>
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>{t("addStudent.major")}</SelectLabel>
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
												{t("addStudent.specialty")}{" "}
												<span className="text-red-500">*</span>
											</label>
											<Select
												value={form.specialtyId}
												onValueChange={handleSpecialtyChange}
												disabled={!selectedDepartment}
											>
												<SelectTrigger className="w-full h-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white">
													<SelectValue
														placeholder={t("addStudent.selectSpecialty")}
													/>
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>
															{t("addStudent.specialty")}
														</SelectLabel>
														{specialties.map((s) => (
															<SelectItem key={s.id} value={s.id}>
																{s.name}
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Personal Information Section */}
									<div className="space-y-4">
										<h2 className="text-base font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
											{t("addStudent.personalInfo")}
										</h2>

										{/* Matricule */}
										<div className="space-y-1">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.matricule")}{" "}
												<span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												name="matricule"
												value={form.matricule}
												onChange={handleChange}
												className="w-full h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white"
												placeholder={t("addStudent.enterMatricule")}
											/>
										</div>

										{/* First and Last Name */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-1">
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													{t("addStudent.firstName")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													name="firstName"
													value={form.firstName}
													onChange={handleChange}
													className="w-full h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white"
													placeholder={t("addStudent.enterFirstName")}
												/>
											</div>
											<div className="space-y-1">
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													{t("addStudent.lastName")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													name="lastName"
													value={form.lastName}
													onChange={handleChange}
													className="w-full h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white"
													placeholder={t("addStudent.enterLastName")}
												/>
											</div>
										</div>

										{/* Date of Birth and Enrollment Year */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-1">
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													{t("addStudent.dateOfBirth")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<input
													type="date"
													name="dateOfBirth"
													value={form.dateOfBirth}
													onChange={handleChange}
													className="w-full h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white"
												/>
											</div>

											<div className="space-y-1">
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													{t("addStudent.enrollmentYear")}{" "}
													<span className="text-red-500">*</span>
												</label>
												<input
													type="number"
													name="enrollmentYear"
													value={form.enrollmentYear}
													onChange={handleChange}
													min="1900"
													max={new Date().getFullYear()}
													className="w-full h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white"
													placeholder={t("addStudent.enterEnrollmentYear")}
												/>
											</div>
										</div>
									</div>

									{/* Submit Button */}
									<div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
										<Button
											type="submit"
											className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded transition-colors"
										>
											{t("addStudent.createStudent")}
										</Button>
									</div>
								</form>
							</div>
						</div>

						{/* Right Column - Documents */}
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 p-6 sticky top-4">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-base font-medium text-gray-900 dark:text-white">
										{t("documents.title")}
									</h2>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{t("documents.count", {
											count: documents.length,
											pluralSuffix: documents.length !== 1 ? "s" : "",
										})}
									</span>
								</div>

								{/* Upload Button */}
								<button
									type="button"
									onClick={() => setOpenDialog(true)}
									className="w-full h-10 border border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
								>
									<Upload className="w-4 h-4" />
									<span className="text-sm font-medium">
										{t("documents.upload")}
									</span>
								</button>

								{/* Documents List */}
								{documents.length > 0 ? (
									<div className="space-y-2 max-h-96 overflow-y-auto">
										{documents.map(({ file, typeName }, index) => (
											<div
												key={index}
												className="group bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
												onClick={() =>
													setViewingDocument({ file, fileName: file.name })
												}
											>
												<div className="flex items-start gap-3">
													<div className="flex-shrink-0 mt-0.5">
														{getFileIcon(file.name)}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between">
															<div className="min-w-0 flex-1">
																<p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
																	{file.name}
																</p>
																<p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">
																	{typeName}
																</p>
																<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
																	{formatFileSize(file.size)}
																</p>
															</div>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setDocuments((prev) =>
																		prev.filter((_, i) => i !== index)
																	);
																}}
																className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
																aria-label={`Remove ${file.name}`}
																type="button"
															>
																<X className="w-4 h-4" />
															</button>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6">
										<div className="w-10 h-10 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
											<FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
										</div>
										<h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
											{t("documents.emptyTitle")}
										</h3>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{t("documents.emptyDescription")}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Document Upload Dialog */}
			<DocumentUploadDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				onConfirm={(docs) => setDocuments(docs)}
			/>

			{/* Document Viewer */}
			{viewingDocument && (
				<DocumentViewer
					file={viewingDocument.file}
					fileName={viewingDocument.fileName}
					isOpen={!!viewingDocument}
					onClose={() => setViewingDocument(null)}
				/>
			)}
		</>
	);
};

export default CreateStudentPage;
