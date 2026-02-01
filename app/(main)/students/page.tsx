/* eslint-disable @typescript-eslint/no-explicit-any */
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
	Funnel,
	Loader2,
	RefreshCcw,
	Search,
	SquarePlus,
	UserRoundPen,
	X,
} from "lucide-react";
import { LayersPlus } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
	fetchStudents,
	searchStudents,
} from "@/app/src/services/studentService";
import pb from "@/lib/pocketbase";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { checkAuthOrRedirect } from "@/app/src/services/authService";

interface StudentFilter {
	matricule?: string;
	graduationYear?: string;
	searchQuery?: string; // for searching name or matricule
	facultyId?: string;
	departmentId?: string;
	fieldId?: string;
	majorId?: string;
	specialtyId?: string;
}

const StudentPage = () => {
	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";
	const router = useRouter();

	const [checkingAuth, setCheckingAuth] = useState(true);

	const [loading, setLoading] = useState(true);
	const [students, setStudents] = useState<any[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [copiedId, setCopiedId] = useState("");

	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const buttonRowRef = useRef<HTMLDivElement>(null);

	const [faculties, setFaculties] = useState<any[]>([]);
	const [departments, setDepartments] = useState<any[]>([]);
	const [fields, setFields] = useState<any[]>([]);
	const [majors, setMajors] = useState<any[]>([]);

	const [specialties, setSpecialties] = useState<any[]>([]);

	const [selectedField, setSelectedField] = useState<string>("");
	const [selectedMajor, setSelectedMajor] = useState<string>("");

	const [selectedFaculty, setSelectedFaculty] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

	const [matricule, setMatricule] = useState("");
	const [graduationYear, setGraduationYear] = useState("");
	const [totalStudents, setTotalStudents] = useState(0);
	const [limit, setLimit] = useState(10);

	useEffect(() => {
		pb.collection("Archive_faculties")
			.getFullList()
			.then((data) => setFaculties(data));
	}, []);

	useEffect(() => {
		try {
			checkAuthOrRedirect(router);
			setCheckingAuth(false);
		} catch {}
	}, [router]);

	useEffect(() => {
		if (selectedFaculty) {
			pb.collection("Archive_departments")
				.getFullList({ filter: `facultyId="${selectedFaculty}"` })
				.then(setDepartments);

			// Reset downstream selections
			setSelectedDepartment("");
			setSpecialties([]);

			setSelectedSpecialty("");
		} else {
			setDepartments([]);
			setSelectedDepartment("");
			setFields([]);
			setMajors([]);
			setSpecialties([]);
			setSelectedField("");
			setSelectedMajor("");
			setSelectedSpecialty("");
		}
	}, [selectedFaculty]);

	useEffect(() => {
		if (selectedDepartment) {
			pb.collection("Archive_fields")
				.getFullList({ filter: `departmentId="${selectedDepartment}"` })
				.then(setFields);

			setSelectedField("");
			setMajors([]);
			setSpecialties([]);
			setSelectedSpecialty("");
		} else {
			setFields([]);
			setSelectedField("");
			setMajors([]);
			setSpecialties([]);
			setSelectedMajor("");
			setSelectedSpecialty("");
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
			setSelectedSpecialty("");
		} else {
			setMajors([]);
			setSelectedMajor("");
			setSpecialties([]);
			setSelectedSpecialty("");
		}
	}, [selectedField]);

	// Get specialties by major
	useEffect(() => {
		if (selectedMajor) {
			pb.collection("Archive_specialties")
				.getFullList({ filter: `majorId="${selectedMajor}"` })
				.then(setSpecialties);

			setSelectedSpecialty("");
		} else {
			setSpecialties([]);
			setSelectedSpecialty("");
		}
	}, [selectedMajor]);

	const handleSearch = async () => {
		if (!selectedDepartment) return;

		setLoading(true);
		try {
			const filter: StudentFilter = {
				facultyId: selectedFaculty || undefined,
				departmentId: selectedDepartment || undefined,
				fieldId: selectedField || undefined,
				majorId: selectedMajor || undefined,
				specialtyId: selectedSpecialty || undefined,
				searchQuery: searchQuery.trim() || undefined,
				matricule: matricule.trim() || undefined,
				graduationYear: graduationYear.trim() || undefined,
			};

			const result = await searchStudents(filter);

			setStudents(result.items);
			setTotalPages(result.totalPages);
			setTotalStudents(result.totalItems ?? 0);
			setPage(1);
			setIsFilterOpen(false);
		} catch (err) {
			console.error("Search failed:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const data = await fetchStudents(page, limit);
				setStudents(data.items);
				setTotalStudents(data.totalItems ?? 0);
			} catch (error) {
				console.error("Failed to fetch:", error);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [page, limit]);

	const loadStudents = async () => {
		setLoading(true);
		try {
			const data = await fetchStudents(page, limit);
			setStudents(data.items);
			setTotalPages(data.totalPages);
			setTotalStudents(data.totalItems ?? 0);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadStudents();
	}, [page]);

	if (checkingAuth) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
				<div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-transparent rounded-full"></div>
			</div>
		);
	}

	return (
		<div className="relative p-4 flex-1 flex-col overflow-hidden bg-gray-50">
			<div className="relative w-full shoadow-md ">
				<div ref={buttonRowRef} className="flex gap-2 mb-2.5 items-center">
					<h3 className="text-2xl font-semibold">{t("students.title")}</h3>
					<Button
						className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:shadow-md"
						disabled={loading}
						onClick={() => loadStudents()}
						aria-label="Refresh student list"
					>
						{loading && students.length === 0 ? (
							<Loader2 className="animate-spin text-black dark:text-white" />
						) : (
							<RefreshCcw className="text-black dark:text-white" />
						)}
					</Button>

					<div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-full p-1 shadow-sm">
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full h-8 w-8 hover:bg-gray-100 dark:hover:bg-zinc-800"
							onClick={() => router.push("/students/new")}
							aria-label="Add new student"
						>
							<SquarePlus className="h-4 w-4 text-black dark:text-white" />
						</Button>

						<div className="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1" />

						<Button
							variant="ghost"
							size="icon"
							className="rounded-full h-8 w-8 hover:bg-gray-100 dark:hover:bg-zinc-800"
							onClick={() => router.push("/students/bulk-new")}
							aria-label="Bulk add students"
						>
							<LayersPlus className="h-4 w-4 text-black dark:text-white" />
						</Button>
					</div>

					<div className="h-6 w-px bg-gray-200 dark:bg-zinc-700" />

					<Button
						onClick={() => setIsFilterOpen(!isFilterOpen)}
						className="bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:shadow-md"
					>
						<Funnel className="text-black " />
					</Button>

					<Button
						onClick={handleSearch}
						disabled={!selectedDepartment}
						className="bg-transparent border hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Search className="text-black" />
					</Button>
				</div>

				<div className="flex flex-wrap gap-2 mb-4">
					{selectedFaculty && (
						<div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
							{t("filterPanel.faculty")}:{" "}
							{faculties.find((f) => f.id === selectedFaculty)?.name}
							<button
								onClick={() => setSelectedFaculty("")}
								aria-label="Remove Faculty Filter"
							>
								<X className="w-4 h-4 hover:text-red-600" />
							</button>
						</div>
					)}

					{selectedDepartment && (
						<div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
							{t("filterPanel.department")}:{" "}
							{departments.find((d) => d.id === selectedDepartment)?.name}
							<button
								onClick={() => setSelectedDepartment("")}
								aria-label="Remove Department Filter"
							>
								<X className="w-4 h-4 hover:text-red-600" />
							</button>
						</div>
					)}

					{selectedField && (
						<div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm">
							{t("filterPanel.field")}:{" "}
							{fields.find((f) => f.id === selectedField)?.name}
							<button
								onClick={() => setSelectedField("")}
								aria-label="Remove Field Filter"
							>
								<X className="w-4 h-4 hover:text-red-600" />
							</button>
						</div>
					)}

					{selectedMajor && (
						<div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm">
							{t("filterPanel.major")}:{" "}
							{majors.find((m) => m.id === selectedMajor)?.name}
							<button
								onClick={() => setSelectedMajor("")}
								aria-label="Remove Major Filter"
							>
								<X className="w-4 h-4 hover:text-red-600" />
							</button>
						</div>
					)}

					{selectedSpecialty && (
						<div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm">
							{t("filterPanel.specialty")}:{" "}
							{specialties.find((s) => s.id === selectedSpecialty)?.name}
							<button
								onClick={() => setSelectedSpecialty("")}
								aria-label="Remove Specialty Filter"
							>
								<X className="w-4 h-4 hover:text-red-600" />
							</button>
						</div>
					)}

					{graduationYear && (
						<div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-sm">
							{t("filterPanel.graduationYear")}: {graduationYear}
							<button
								onClick={() => setGraduationYear("")}
								aria-label="Remove Graduation Year Filter"
							>
								<X className="w-4 h-4 hover:text-red-600" />
							</button>
						</div>
					)}
				</div>

				{/* Filter Panel (full width) */}
				{isFilterOpen && (
					<div
						className={`absolute top-full mt-2 z-50 w-full md:w-170 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 shadow-lg max-h-[85vh] flex flex-col
        ${isRtl ? "right-0" : "left-0"}`}
					>
						{/* Header - Fixed */}
						<div className="flex justify-between items-center px-5 py-4 border-b border-[#d1d0d0] dark:border-zinc-800">
							<h4 className="text-lg font-semibold text-gray-900 dark:text-white">
								{t("filterPanel.title")}
							</h4>
							<Button
								onClick={() => setIsFilterOpen(false)}
								aria-label="Close filter panel"
								className="bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full h-8 w-8 p-0"
							>
								<X className="h-5 w-5 text-gray-500 hover:text-red-600 dark:text-gray-400" />
							</Button>
						</div>

						{/* Scrollable Content Area */}
						<div className="flex-1 overflow-y-auto p-5 space-y-6">
							{/* Search Field */}
							<div className="space-y-1.5">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									{t("filterPanel.searchLabel")}
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
									</div>
									<input
										type="text"
										placeholder={t("filterPanel.searchPlaceholder")}
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										disabled={!selectedDepartment}
										className={`w-full pl-9 pr-3 h-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-zinc-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
											!selectedDepartment ? "opacity-50 cursor-not-allowed" : ""
										}`}
									/>
								</div>
							</div>

							<div>
								<h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
									{t("filterPanel.options")}
								</h3>

								<div className="space-y-4">
									{/* Row 1: Matricule & Year */}
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.matricule")}
											</label>
											<input
												type="text"
												name="matricule"
												value={matricule}
												onChange={(e) => setMatricule(e.target.value)}
												className="w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white text-sm"
												placeholder={t("addStudent.enterMatricule")}
											/>
										</div>
										<div className="space-y-1.5">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.graduationYear")}
											</label>
											<input
												type="number"
												min="1900"
												max="2100"
												name="graduationYear"
												value={graduationYear}
												onChange={(e) => setGraduationYear(e.target.value)}
												className="w-full h-10 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white text-sm"
												placeholder="2024"
											/>
										</div>
									</div>

									{/* Row 2: Faculty & Department */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.faculty")}{" "}
												<span className="text-red-500">*</span>
											</label>
											<Select
												value={selectedFaculty}
												onValueChange={setSelectedFaculty}
											>
												<SelectTrigger className="w-full h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400">
													<SelectValue
														placeholder={t("addStudent.selectFaculty")}
													/>
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>{t("addStudent.faculty")}</SelectLabel>
														{faculties.map((f) => (
															<SelectItem key={f.id} value={f.id}>
																{f.name}
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-1.5">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.department")}{" "}
												<span className="text-red-500">*</span>
											</label>
											<Select
												value={selectedDepartment}
												onValueChange={setSelectedDepartment}
												disabled={!selectedFaculty}
											>
												<SelectTrigger className="w-full h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
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
									</div>

									{/* Stacked Fields */}
									<div className="space-y-4 pt-2">
										<div className="space-y-1.5">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.field")}
											</label>
											<Select
												value={selectedField}
												onValueChange={setSelectedField}
												disabled={!selectedDepartment}
											>
												<SelectTrigger className="w-full h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
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

										<div className="space-y-1.5">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.major")}
											</label>
											<Select
												value={selectedMajor}
												onValueChange={setSelectedMajor}
												disabled={!selectedField}
											>
												<SelectTrigger className="w-full h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 disabled:opacity-50">
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

										<div className="space-y-1.5">
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t("addStudent.specialty")}
											</label>
											<Select
												value={selectedSpecialty}
												onValueChange={setSelectedSpecialty}
												disabled={!selectedMajor}
											>
												<SelectTrigger className="w-full h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 text-gray-900 dark:text-white disabled:opacity-50">
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
								</div>
							</div>
						</div>

						{/* Footer - Fixed */}
						<div className="p-4 border-t border-[#d1d0d0] dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 rounded-b-lg flex justify-end">
							<Button
								onClick={() => setIsFilterOpen(false)}
								className="text-sm px-6"
							>
								{t("filterPanel.apply")}
							</Button>
						</div>
					</div>
				)}
			</div>
			<div className="flex-1 overflow-auto bg-white border rounded-2xl">
				<Table className="text-sm rounded-xl shadow-lg bg-white">
					<TableHeader className="bg-[#f9fafb]">
						<TableRow>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.matricule")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.firstName")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.lastName")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.dateOfBirth")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.field")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.major")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.enrollmentYear")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.graduationYear")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.specialty")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.numberOfDocuments")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.createdAt")}
							</TableHead>
							<TableHead className={isRtl ? "text-right" : "text-left"}>
								{t("students.actions")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading && students.length === 0 ? (
							<TableRow>
								<TableCell colSpan={11} className="text-center py-10">
									<Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
									<span className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">
										{t("loading")}
									</span>
								</TableCell>
							</TableRow>
						) : !loading && students.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={11}
									className="text-center py-10 text-gray-500 dark:text-gray-400"
								>
									{t("students.notFound")}
								</TableCell>
							</TableRow>
						) : (
							students.map((student) => (
								<TableRow
									key={student.id}
									className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:cursor-pointer transition-colors duration-100"
									onDoubleClick={() =>
										router.push(`/students/info?stuId=${student.id}`)
									}
								>
									<TableCell>
										<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200">
											{student.matricule}
											{copiedId === student.matricule ? (
												<Check size={14} className="text-green-500" />
											) : (
												<button
													onClick={(e) => {
														e.stopPropagation();
														navigator.clipboard.writeText(student.matricule);
														setCopiedId(student.matricule);
														setTimeout(() => setCopiedId(""), 1500);
													}}
													aria-label={t("actions.copyId")}
													className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
												>
													<Copy size={12} />
												</button>
											)}
										</span>
									</TableCell>
									<TableCell>{student.firstName}</TableCell>
									<TableCell>{student.lastName}</TableCell>
									<TableCell>
										{new Date(student.dateOfBirth).toLocaleDateString()}
									</TableCell>
									<TableCell>
										{student.expand?.fieldId?.name ?? "N/A"}
									</TableCell>
									<TableCell>
										{student.expand?.majorId?.name ?? "N/A"}
									</TableCell>
									<TableCell>{student.enrollmentYear}</TableCell>
									<TableCell>{student.graduationYear}</TableCell>
									<TableCell>
										{student.expand?.specialtyId?.name ?? "N/A"}
									</TableCell>
									<TableCell>{student.documentsCount}</TableCell>
									<TableCell>
										{new Date(student.created).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												size="icon"
												variant="outline"
												className="hover:cursor-pointer h-8 w-8"
												onClick={(e) => {
													e.stopPropagation();
													router.push(`/students/update?stuId=${student.id}`);
												}}
												aria-label="Edit student"
											>
												<UserRoundPen size={16} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
					<TableFooter className="bg-gray-50/50 dark:bg-zinc-800/50">
						<TableRow>
							<TableCell colSpan={12} className="py-4 px-6">
								<div
									className="flex flex-col md:flex-row items-center justify-between w-full gap-4"
									dir={isRtl ? "rtl" : "ltr"}
								>
									<div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
										<span>
											{t("pagination.Showing")}{" "}
											<span className="font-bold">
												{totalStudents === 0 ? 0 : (page - 1) * limit + 1}
											</span>{" "}
											{t("pagination.to")}{" "}
											<span className="font-bold">
												{Math.min(page * limit, totalStudents)}
											</span>{" "}
											{t("pagination.of")}{" "}
											<span className="font-bold">{totalStudents}</span>{" "}
											{t("pagination.Records")}
										</span>

										{/* Separator */}
										<span className="hidden sm:inline text-gray-300">|</span>

										{/* Dropdown */}
										<div className="flex items-center gap-2 ml-2">
											<span className="whitespace-nowrap">
												{t("pagination.show")}
											</span>
											<Select
												value={limit.toString()}
												onValueChange={(value) => {
													setLimit(Number(value));
													setPage(1);
												}}
											>
												<SelectTrigger className="w-17.5 h-9 dark:bg-[#1f1f1f] dark:text-white">
													<SelectValue placeholder={limit.toString()} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="10">10</SelectItem>
													<SelectItem value="20">20</SelectItem>
													<SelectItem value="50">50</SelectItem>
													<SelectItem value="100">100</SelectItem>
												</SelectContent>
											</Select>
											<span className="whitespace-nowrap">
												{t("pagination.perPage")}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-4">
										<Button
											variant="outline"
											onClick={() => setPage((p) => Math.max(p - 1, 1))}
											disabled={page === 1 || loading}
											className="px-3 py-1.5 text-sm h-auto"
										>
											{t("pagination.previous")}
										</Button>
										<span className="text-sm text-gray-700 dark:text-gray-300">
											{t("pagination.pageOf", { page, totalPages })}
										</span>
										<Button
											variant="outline"
											onClick={() =>
												setPage((p) => Math.min(p + 1, totalPages))
											}
											disabled={page >= totalPages || loading}
											className="px-3 py-1.5 text-sm h-auto"
										>
											{t("pagination.next")}
										</Button>
									</div>

									<div className="hidden md:block w-auto text-transparent select-none">
										Placeholder
									</div>
								</div>
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</div>
		</div>
	);
};

export default StudentPage;
