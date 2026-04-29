"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	ArrowLeftRight,
	FolderOpen,
	Pause,
	Play,
	CheckCircle,
	XCircle,
	Loader2,
	FileText,
	ChevronDown,
	ChevronUp,
	AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Image from "next/image";
import fileSvgIcon from "../.././../../public/file.svg";
import imageIcon from "../.././../../public/image.svg";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import pb from "@/lib/pocketbase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "setup" | "reviewing" | "importing" | "done";

const SUPPORTED_EXTS = ["jpg", "jpeg", "png", "webp", "pdf"];

interface DroppedFolder {
	id: string;
	name: string;
	files: File[];
}

interface ParsedStudent {
	folderId: string;
	folderName: string;
	firstName: string;
	lastName: string;
	matricule: string;
	files: File[];
	enrollmentYear: string;
	graduationYear: string;
	fieldId: string;
	majorId: string;
	specialtyId: string;
	defaultDocTypeId: string;
}

interface ImportResult {
	folderName: string;
	status: "success" | "error";
	message?: string;
}

interface BatchConfig {
	facultyId: string;
	departmentId: string;
	fieldId: string;
	majorId: string;
	specialtyId: string;
	enrollmentYear: string;
	graduationYear: string;
	defaultDocTypeId: string;
}

interface PBRecord {
	id: string;
	name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createStudent(student: ParsedStudent): Promise<string> {
	const record = await pb.collection("Archive_students").create({
		matricule: student.matricule,
		firstName: student.firstName,
		lastName: student.lastName,
		enrollmentYear: student.enrollmentYear,
		graduationYear: student.graduationYear,
		fieldId: student.fieldId,
		majorId: student.majorId,
		specialtyId: student.specialtyId,
	});
	return record.id;
}

async function uploadDocument(
	studentId: string,
	file: File,
	typeId: string,
): Promise<void> {
	if (!file || file.size === 0) return;
	const fileForm = new FormData();
	fileForm.append("file", file);
	fileForm.append("typeId", typeId);
	const fileRecord = await pb.collection("Archive_files").create(fileForm);
	await pb.collection("Archive_documents").create({
		studentId,
		fileId: fileRecord.id,
	});
}

async function readDirEntry(
	dirEntry: FileSystemDirectoryEntry,
): Promise<File[]> {
	const files: File[] = [];
	const readBatch = (
		r: FileSystemDirectoryReader,
	): Promise<FileSystemEntry[]> =>
		new Promise((res, rej) => r.readEntries(res, rej));

	const processEntry = async (entry: FileSystemEntry): Promise<void> => {
		if (entry.isFile) {
			const fe = entry as FileSystemFileEntry;
			const file = await new Promise<File>((res, rej) => fe.file(res, rej));
			const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
			if (SUPPORTED_EXTS.includes(ext)) files.push(file);
		} else if (entry.isDirectory) {
			const de = entry as FileSystemDirectoryEntry;
			const reader = de.createReader();
			let batch: FileSystemEntry[];
			do {
				batch = await readBatch(reader);
				for (const e of batch) await processEntry(e);
			} while (batch.length > 0);
		}
	};

	const topReader = dirEntry.createReader();
	let batch: FileSystemEntry[];
	do {
		batch = await readBatch(topReader);
		for (const e of batch) await processEntry(e);
	} while (batch.length > 0);

	return files;
}

function parseName(folderName: string): {
	firstName: string;
	lastName: string;
} {
	const cleaned = folderName.trim().replace(/[_\-\.]+/g, " ");

	if (cleaned.includes(" ")) {
		const parts = cleaned.split(" ").filter(Boolean);
		const firstName = parts[0];
		const lastName = parts.slice(1).join(" ");
		return {
			firstName: capitalize(firstName),
			lastName: capitalize(lastName),
		};
	}

	const camel = cleaned.replace(/([A-Z])/g, " $1").trim();
	const parts = camel.split(" ").filter(Boolean);
	if (parts.length >= 2) {
		return {
			firstName: capitalize(parts[0]),
			lastName: capitalize(parts.slice(1).join(" ")),
		};
	}

	return { firstName: "Unknown", lastName: capitalize(cleaned) };
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatEta(ms: number): string {
	if (!isFinite(ms) || ms <= 0) return "calculating…";
	const s = Math.round(ms / 1000);
	if (s < 60) return `~${s}s`;
	const m = Math.round(s / 60);
	if (m < 60) return `~${m}m`;
	return `~${(s / 3600).toFixed(1)}h`;
}

function FileIcon({ name }: { name: string }) {
	const ext = name.split(".").pop()?.toLowerCase() ?? "";
	const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);

	return (
		<Image
			src={isImage ? imageIcon : fileSvgIcon}
			alt={isImage ? "image file" : "file"}
			width={20}
			height={20}
		/>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({
	value,
	className = "",
}: {
	value: number;
	className?: string;
}) {
	return (
		<div
			className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}
		>
			<div
				className="h-full bg-blue-500 rounded-full transition-all duration-300"
				style={{ width: `${Math.min(100, value)}%` }}
			/>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AddInBulk = () => {
	const [phase, setPhase] = useState<Phase>("setup");
	const router = useRouter();
	const { t, i18n } = useTranslation();

	// RTL support — Arabic is RTL
	const isRTL = i18n.language === "ar";
	const dir = isRTL ? "rtl" : "ltr";

	// ── Dropdown data
	const [faculties, setFaculties] = useState<PBRecord[]>([]);
	const [departments, setDepartments] = useState<PBRecord[]>([]);
	const [fields, setFields] = useState<PBRecord[]>([]);
	const [majors, setMajors] = useState<PBRecord[]>([]);
	const [specialties, setSpecialties] = useState<PBRecord[]>([]);
	const [docTypes, setDocTypes] = useState<PBRecord[]>([]);

	// ── Drag & drop
	const [isDragging, setIsDragging] = useState(false);
	const [dropped, setDropped] = useState<DroppedFolder[]>([]);
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);

	// ── Config
	const [config, setConfig] = useState<BatchConfig>({
		facultyId: "",
		departmentId: "",
		fieldId: "",
		majorId: "",
		specialtyId: "",
		enrollmentYear: "",
		graduationYear: "",
		defaultDocTypeId: "",
	});

	// ── Parsed students
	const [students, setStudents] = useState<ParsedStudent[]>([]);

	// ── Import progress
	const [importIndex, setImportIndex] = useState(0);
	const [results, setResults] = useState<ImportResult[]>([]);
	const [isPaused, setIsPaused] = useState(false);
	const [importStartTime, setImportStartTime] = useState<number>(0);
	const [showLog, setShowLog] = useState(false);

	const folderInputRef = useRef<HTMLInputElement>(null);

	const pausedRef = useRef(false);
	const stopRef = useRef(false);
	const droppingRef = useRef(false);
	const configRef = useRef(config);
	useEffect(() => {
		configRef.current = config;
	}, [config]);

	// ── Initial loads
	useEffect(() => {
		pb.collection("Archive_faculties")
			.getFullList()
			.then((r) => setFaculties(r as unknown as PBRecord[]));
		pb.collection("Document_types")
			.getFullList({ sort: "name" })
			.then((r) => setDocTypes(r as unknown as PBRecord[]));
	}, []);

	// ── Cascade selects
	useEffect(() => {
		if (config.facultyId) {
			pb.collection("Archive_departments")
				.getFullList({ filter: `facultyId="${config.facultyId}"` })
				.then((r) => setDepartments(r as unknown as PBRecord[]));
		} else setDepartments([]);
		setConfig((c) => ({
			...c,
			departmentId: "",
			fieldId: "",
			majorId: "",
			specialtyId: "",
		}));
		setFields([]);
		setMajors([]);
		setSpecialties([]);
	}, [config.facultyId]);

	useEffect(() => {
		if (config.departmentId) {
			pb.collection("Archive_fields")
				.getFullList({ filter: `departmentId="${config.departmentId}"` })
				.then((r) => setFields(r as unknown as PBRecord[]));
		} else setFields([]);
		setConfig((c) => ({ ...c, fieldId: "", majorId: "", specialtyId: "" }));
		setMajors([]);
		setSpecialties([]);
	}, [config.departmentId]);

	useEffect(() => {
		if (config.fieldId) {
			pb.collection("Archive_majors")
				.getFullList({ filter: `fieldId="${config.fieldId}"` })
				.then((r) => setMajors(r as unknown as PBRecord[]));
		} else setMajors([]);
		setConfig((c) => ({ ...c, majorId: "", specialtyId: "" }));
		setSpecialties([]);
	}, [config.fieldId]);

	useEffect(() => {
		if (config.majorId) {
			pb.collection("Archive_specialties")
				.getFullList({ filter: `majorId="${config.majorId}"` })
				.then((r) => setSpecialties(r as unknown as PBRecord[]));
		} else setSpecialties([]);
		setConfig((c) => ({ ...c, specialtyId: "" }));
	}, [config.majorId]);

	const canStart =
		dropped.length > 0 &&
		!!config.fieldId &&
		!!config.majorId &&
		!!config.specialtyId &&
		!!config.defaultDocTypeId;

	// ── Drag handlers
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => setIsDragging(false), []);

	async function getFilesFromEntry(entry: FileSystemEntry): Promise<File[]> {
		const files: File[] = [];
		if (entry.isFile) {
			const fileEntry = entry as FileSystemFileEntry;
			const file = await new Promise<File>((res, rej) =>
				fileEntry.file(res, rej),
			);
			const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
			if (SUPPORTED_EXTS.includes(ext)) files.push(file);
		} else if (entry.isDirectory) {
			const dirEntry = entry as FileSystemDirectoryEntry;
			const reader = dirEntry.createReader();
			const entries = await new Promise<FileSystemEntry[]>((res, rej) =>
				reader.readEntries(res, rej),
			);
			for (const e of entries) {
				const subFiles = await getFilesFromEntry(e);
				files.push(...subFiles);
			}
		}
		return files;
	}

	const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const allFiles = Array.from(e.target.files || []);
		if (allFiles.length === 0) return;

		const folderMap = new Map<string, File[]>();

		allFiles.forEach((file) => {
			const parts = file.webkitRelativePath.split("/");
			// If path is "Parent/Student/file.jpg", parts[1] is the student folder name.
			// If path is "Student/file.jpg", parts[0] is the student folder name.
			const folderName = parts.length > 2 ? parts[1] : parts[0];

			const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
			if (SUPPORTED_EXTS.includes(ext)) {
				if (!folderMap.has(folderName)) folderMap.set(folderName, []);
				folderMap.get(folderName)?.push(file);
			}
		});

		const newFolders: DroppedFolder[] = Array.from(folderMap.entries()).map(
			([name, files]) => ({
				id: crypto.randomUUID(),
				name,
				files,
			}),
		);

		setDropped((prev) => [...prev, ...newFolders]);
		if (folderInputRef.current) folderInputRef.current.value = "";
	};

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			if (droppingRef.current) return;
			droppingRef.current = true;

			const items = Array.from(e.dataTransfer.items);
			const newFolders: DroppedFolder[] = [];

			for (const item of items) {
				const entry = item.webkitGetAsEntry();
				if (!entry || !entry.isDirectory) continue;

				const dirEntry = entry as FileSystemDirectoryEntry;
				const reader = dirEntry.createReader();
				const children = await new Promise<FileSystemEntry[]>((res, rej) =>
					reader.readEntries(res, rej),
				);

				const subDirs = children.filter((c) => c.isDirectory);

				if (subDirs.length > 0) {
					// Case: User dropped a folder containing multiple student folders
					for (const sub of subDirs) {
						const files = await getFilesFromEntry(sub);
						if (files.length > 0) {
							newFolders.push({
								id: crypto.randomUUID(),
								name: sub.name,
								files,
							});
						}
					}
				} else {
					// Case: User dropped a single student folder
					const files = await getFilesFromEntry(dirEntry);
					if (files.length > 0) {
						newFolders.push({
							id: crypto.randomUUID(),
							name: dirEntry.name,
							files,
						});
					}
				}
			}

			setDropped((prev) => [...prev, ...newFolders]);
			droppingRef.current = false;
		},
		[t],
	);

	const toggleFolderExpand = useCallback((id: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleStartReview = useCallback(() => {
		const cfg = configRef.current;
		const parsed: ParsedStudent[] = dropped.map((folder, i) => {
			const { firstName, lastName } = parseName(folder.name);
			return {
				folderId: folder.id,
				folderName: folder.name,
				firstName,
				lastName,
				matricule: `IMP-${cfg.enrollmentYear || "0000"}-${String(i + 1).padStart(5, "0")}`,
				files: folder.files,
				enrollmentYear: cfg.enrollmentYear.trim() || "N/A",
				graduationYear: cfg.graduationYear.trim() || "N/A",
				fieldId: cfg.fieldId,
				majorId: cfg.majorId,
				specialtyId: cfg.specialtyId,
				defaultDocTypeId: cfg.defaultDocTypeId,
			};
		});
		setStudents(parsed);
		setPhase("reviewing");
	}, [dropped]);

	const updateStudent = useCallback(
		(folderId: string, key: keyof ParsedStudent, value: string) => {
			setStudents((prev) =>
				prev.map((s) => (s.folderId === folderId ? { ...s, [key]: value } : s)),
			);
		},
		[],
	);

	const swapStudentName = useCallback((folderId: string) => {
		setStudents((prev) =>
			prev.map((s) =>
				s.folderId === folderId
					? { ...s, firstName: s.lastName, lastName: s.firstName }
					: s,
			),
		);
	}, []);

	const swapAllNames = useCallback(() => {
		setStudents((prev) =>
			prev.map((s) => ({ ...s, firstName: s.lastName, lastName: s.firstName })),
		);
	}, []);

	const handleStartImport = useCallback(async () => {
		setPhase("importing");
		setImportIndex(0);
		setResults([]);
		setIsPaused(false);
		pausedRef.current = false;
		stopRef.current = false;
		setImportStartTime(Date.now());

		for (let i = 0; i < students.length; i++) {
			if (stopRef.current) break;

			while (pausedRef.current) {
				await new Promise((r) => setTimeout(r, 300));
			}

			setImportIndex(i);
			const student = students[i];

			try {
				const studentId = await createStudent(student);
				for (const file of student.files) {
					try {
						await uploadDocument(studentId, file, student.defaultDocTypeId);
					} catch {
						console.warn(`File upload failed: ${file.name}`);
					}
				}
				setResults((prev) => [
					...prev,
					{ folderName: student.folderName, status: "success" },
				]);
			} catch (err: any) {
				setResults((prev) => [
					...prev,
					{
						folderName: student.folderName,
						status: "error",
						message: err.message,
					},
				]);
			}
		}

		setPhase("done");
	}, [students]);

	const togglePause = useCallback(() => {
		const next = !pausedRef.current;
		pausedRef.current = next;
		setIsPaused(next);
	}, []);

	// ─── Derived progress values
	const total = students.length;
	const done = results.length;
	const successes = results.filter((r) => r.status === "success").length;
	const failures = results.filter((r) => r.status === "error").length;
	const pct = total > 0 ? Math.round((done / total) * 100) : 0;

	const elapsed = Date.now() - importStartTime;
	const perItem = done > 0 ? elapsed / done : 0;
	const remaining = perItem * (total - done);

	// Cascading select config
	const selectConfigs = [
		{
			label: t("students.faculty"),
			key: "facultyId" as const,
			list: faculties,
			disabled: false,
			placeholder: t("students.selectFaculty"),
		},
		{
			label: t("students.department"),
			key: "departmentId" as const,
			list: departments,
			disabled: !config.facultyId,
			placeholder: t("students.selectDepartment"),
		},
		{
			label: t("students.field"),
			key: "fieldId" as const,
			list: fields,
			disabled: !config.departmentId,
			placeholder: t("students.selectField"),
		},
		{
			label: t("students.major"),
			key: "majorId" as const,
			list: majors,
			disabled: !config.fieldId,
			placeholder: t("students.selectMajor"),
		},
		{
			label: t("students.specialty"),
			key: "specialtyId" as const,
			list: specialties,
			disabled: !config.majorId,
			placeholder: t("students.selectSpecialty"),
		},
	];

	// ─────────────────────────────────────────────────────────────────────────
	// RENDER
	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div dir={dir} className="min-h-full bg-gray-50 p-4">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<button
						onClick={() => router.back()}
						className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:underline transition-colors"
					>
						{/* Arrow flips automatically with dir="rtl" via CSS transform */}
						<ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
						{t("common.back")}
					</button>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
						{t("students.bulkImportTitle")}
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{t("students.bulkImportDescription")}
					</p>
				</div>

				{/* ── PHASE: SETUP ────────────────────────────────────────────────── */}
				{phase === "setup" && (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<input
							type="file"
							ref={folderInputRef}
							className="hidden"
							{...({
								webkitdirectory: "",
								mozdirectory: "",
								directory: "",
							} as any)}
							onChange={handleFolderSelect}
						/>
						{/* Drop zone + folder list */}
						<div className="lg:col-span-2 space-y-4">
							<div
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onClick={() => folderInputRef.current?.click()} // Click anywhere to open
								className={`cursor-pointer rounded-lg border-2 border-dashed p-14 text-center transition-all select-none ${
									isDragging
										? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
										: "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-gray-400"
								}`}
							>
								<FolderOpen
									className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
								/>
								<p className="text-base font-medium text-gray-700 dark:text-gray-200 mb-1">
									{isDragging
										? t("students.dropRelease")
										: "Drag & Drop folders or click to select"}
								</p>
								<Button
									variant="outline"
									size="sm"
									className="mt-4"
									onClick={(e) => {
										e.stopPropagation(); // Prevent double trigger from parent div
										folderInputRef.current?.click();
									}}
								>
									<FolderOpen className="w-4 h-4 mr-2" />
									Select Folder
								</Button>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
									Supports: JPG, PNG, WEBP, PDF
								</p>
							</div>

							{/* Folder list */}
							{dropped.length > 0 && (
								<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 max-h-[28rem] overflow-y-auto">
									<div className="px-4 py-2 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-100 dark:border-gray-700">
										<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
											{t("students.foldersReady", { count: dropped.length })}
										</span>
										<button
											onClick={() => {
												setDropped([]);
												setExpandedFolders(new Set());
											}}
											className="text-xs text-red-500 hover:underline"
										>
											{t("students.clearAll")}
										</button>
									</div>

									{dropped.map((f) => {
										const isExpanded = expandedFolders.has(f.id);
										return (
											<div key={f.id}>
												{/* Folder row */}
												<div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
													<button
														onClick={() => toggleFolderExpand(f.id)}
														className="flex items-center gap-2 min-w-0 flex-1 text-start"
													>
														<FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
														<span className="text-sm text-gray-800 dark:text-gray-200 truncate">
															{f.name}
														</span>
													</button>
													<div className="flex items-center gap-3 flex-shrink-0 ms-3">
														<button
															onClick={() => toggleFolderExpand(f.id)}
															className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
														>
															<span>
																{t("students.filesCount", {
																	count: f.files.length,
																})}
															</span>
															{isExpanded ? (
																<ChevronUp className="w-3 h-3" />
															) : (
																<ChevronDown className="w-3 h-3" />
															)}
														</button>
														<button
															onClick={() =>
																setDropped((p) =>
																	p.filter((x) => x.id !== f.id),
																)
															}
															className="text-xs text-gray-400 hover:text-red-500 transition-colors"
														>
															✕
														</button>
													</div>
												</div>

												{/* Expanded file list */}
												{isExpanded && (
													<div className="bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 px-4 py-2 space-y-1">
														{f.files.map((file, fi) => (
															<div
																key={fi}
																className="flex items-center gap-2 py-0.5"
															>
																<span className="text-sm leading-none">
																	<FileIcon name={file.name} />
																</span>
																<span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
																	{file.name}
																</span>
																<span className="text-xs text-gray-400 shrink-0">
																	{file.size < 1024 * 1024
																		? `${Math.round(file.size / 1024)} KB`
																		: `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
																</span>
															</div>
														))}
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Config panel */}
						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 space-y-4 sticky top-4 h-fit">
							<div>
								<h2 className="text-sm font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-1">
									{t("students.batchConfig")}
								</h2>
								<p className="text-xs text-gray-400">
									{t("students.batchConfigDesc")}
								</p>
							</div>

							{/* Cascading selects */}
							{selectConfigs.map(
								({ label, key, list, disabled, placeholder }) => (
									<div key={key} className="space-y-1">
										<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
											{label} *
										</label>
										<Select
											value={(config as any)[key]}
											onValueChange={(v) => {
												setConfig((c) => {
													const reset: Partial<BatchConfig> = {};
													if (key === "facultyId") {
														reset.departmentId = "";
														reset.fieldId = "";
														reset.majorId = "";
														reset.specialtyId = "";
													} else if (key === "departmentId") {
														reset.fieldId = "";
														reset.majorId = "";
														reset.specialtyId = "";
													} else if (key === "fieldId") {
														reset.majorId = "";
														reset.specialtyId = "";
													} else if (key === "majorId") {
														reset.specialtyId = "";
													}
													return { ...c, ...reset, [key]: v };
												});
											}}
											disabled={disabled}
										>
											<SelectTrigger className="h-8 text-sm">
												<SelectValue placeholder={placeholder} />
											</SelectTrigger>
											<SelectContent>
												{list.map((item: PBRecord) => (
													<SelectItem key={item.id} value={item.id}>
														{item.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								),
							)}

							{/* Default document type */}
							<div className="space-y-1">
								<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
									{t("students.defaultDocType")} *
								</label>
								<Select
									value={config.defaultDocTypeId}
									onValueChange={(v) =>
										setConfig((c) => ({ ...c, defaultDocTypeId: v }))
									}
								>
									<SelectTrigger className="h-8 text-sm">
										<SelectValue placeholder={t("students.selectDocType")} />
									</SelectTrigger>
									<SelectContent>
										{docTypes.map((dt) => (
											<SelectItem key={dt.id} value={dt.id}>
												{dt.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Year inputs */}
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
										{t("students.enrollmentYear")}
										<span className="ms-1 text-gray-400 font-normal">
											({t("common.optional")})
										</span>
									</label>
									<Input
										className="h-8 text-sm"
										placeholder={t("students.enrollmentYearPlaceholder")}
										value={config.enrollmentYear}
										onChange={(e) =>
											setConfig((c) => ({
												...c,
												enrollmentYear: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-1">
									<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
										{t("students.graduationYear")}
										<span className="ms-1 text-gray-400 font-normal">
											({t("common.optional")})
										</span>
									</label>
									<Input
										className="h-8 text-sm"
										placeholder={t("students.graduationYearPlaceholder")}
										value={config.graduationYear}
										onChange={(e) =>
											setConfig((c) => ({
												...c,
												graduationYear: e.target.value,
											}))
										}
									/>
								</div>
							</div>

							<Button
								onClick={handleStartReview}
								disabled={!canStart}
								className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-2"
							>
								{dropped.length > 0
									? t("students.reviewParsedNamesCount", {
											count: dropped.length,
										})
									: t("students.reviewParsedNames")}
							</Button>

							{dropped.length > 100 && (
								<p className="text-xs text-amber-600 dark:text-amber-400 text-center flex items-center gap-1 justify-center">
									<AlertTriangle className="w-3.5 h-3.5" />
									{t("students.largeBatchWarning", {
										eta: formatEta(dropped.length * 6000),
									})}
								</p>
							)}
						</div>
					</div>
				)}

				{/* ── PHASE: REVIEWING ───────────────────────────────────────────── */}
				{phase === "reviewing" && (
					<div className="space-y-4">
						<div className="flex items-center justify-between flex-wrap gap-2">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{t("students.reviewDesc")}
							</p>
							<div className="flex gap-2 flex-wrap">
								<Button
									variant="outline"
									onClick={() => setPhase("setup")}
									className="h-8 text-sm"
								>
									{t("common.back")}
								</Button>
								<Button
									variant="outline"
									onClick={swapAllNames}
									className="h-8 text-sm gap-1.5"
									title={t("students.swapAllNamesTitle")}
								>
									<ArrowLeftRight className="w-3.5 h-3.5" />
									{t("students.swapAllNames")}
								</Button>
								<Button
									onClick={handleStartImport}
									className="h-8 text-sm bg-gray-900 hover:bg-gray-800 text-white"
								>
									{t("students.startImport", { count: students.length })}
								</Button>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
							<div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
								<table className="w-full text-sm">
									<thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
										<tr>
											<th className="text-start px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-8">
												{t("students.colNumber")}
											</th>
											<th className="text-start px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												{t("students.colFolderName")}
											</th>
											<th className="text-start px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												{t("students.colFirstName")}
											</th>
											<th className="w-8" />
											<th className="text-start px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												{t("students.colLastName")}
											</th>
											<th className="text-start px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												{t("students.colMatricule")}
											</th>
											<th className="text-start px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												{t("students.colFiles")}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100 dark:divide-gray-700">
										{students.map((s, i) => (
											<tr
												key={s.folderId}
												className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
											>
												<td className="px-4 py-2 text-xs text-gray-400">
													{i + 1}
												</td>
												<td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[160px]">
													{s.folderName}
												</td>
												<td className="px-2 py-1.5">
													<Input
														className="h-7 text-sm border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500"
														value={s.firstName}
														onChange={(e) =>
															updateStudent(
																s.folderId,
																"firstName",
																e.target.value,
															)
														}
													/>
												</td>
												<td className="px-0 py-1.5 w-8">
													<button
														onClick={() => swapStudentName(s.folderId)}
														title={t("students.swapName")}
														className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"
													>
														<ArrowLeftRight className="w-3.5 h-3.5" />
													</button>
												</td>
												<td className="px-2 py-1.5">
													<Input
														className="h-7 text-sm border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500"
														value={s.lastName}
														onChange={(e) =>
															updateStudent(
																s.folderId,
																"lastName",
																e.target.value,
															)
														}
													/>
												</td>
												<td className="px-2 py-1.5">
													<Input
														className="h-7 text-sm font-mono border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500"
														value={s.matricule}
														onChange={(e) =>
															updateStudent(
																s.folderId,
																"matricule",
																e.target.value,
															)
														}
													/>
												</td>
												<td className="px-4 py-2">
													<span className="flex items-center gap-1 text-xs text-gray-500">
														<FileText className="w-3.5 h-3.5" />
														{s.files.length}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

				{/* ── PHASE: IMPORTING ──────────────────────────────────────────── */}
				{phase === "importing" && (
					<div className="space-y-5 max-w-2xl mx-auto">
						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-5">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-base font-semibold text-gray-900 dark:text-white">
										{t("students.importing")}
									</h2>
									<p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
										{isPaused
											? t("students.paused")
											: t("students.processing", {
													name: students[importIndex]?.folderName ?? "…",
												})}
									</p>
								</div>
								<Button
									onClick={togglePause}
									variant="outline"
									className="h-9 gap-2"
								>
									{isPaused ? (
										<>
											<Play className="w-4 h-4" /> {t("common.resume")}
										</>
									) : (
										<>
											<Pause className="w-4 h-4" /> {t("common.pause")}
										</>
									)}
								</Button>
							</div>

							<div className="space-y-2">
								<ProgressBar value={pct} />
								<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
									<span>{t("students.progress", { done, total })}</span>
									<span>{pct}%</span>
									<span>
										{isPaused ? t("students.paused") : formatEta(remaining)}
									</span>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
									<div className="text-xl font-bold text-gray-900 dark:text-white">
										{done}
									</div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
										{t("students.processed")}
									</div>
								</div>
								<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
									<div className="text-xl font-bold text-green-600 dark:text-green-400">
										{successes}
									</div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
										{t("students.succeeded")}
									</div>
								</div>
								<div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
									<div className="text-xl font-bold text-red-500 dark:text-red-400">
										{failures}
									</div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
										{t("students.failed")}
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
							<button
								onClick={() => setShowLog((v) => !v)}
								className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
							>
								<span>
									{t("students.importLog", { count: results.length })}
								</span>
								{showLog ? (
									<ChevronUp className="w-4 h-4" />
								) : (
									<ChevronDown className="w-4 h-4" />
								)}
							</button>
							{showLog && (
								<div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
									{results.length === 0 && (
										<p className="text-sm text-gray-400 px-4 py-3 text-center">
											{t("students.noResults")}
										</p>
									)}
									{[...results].reverse().map((r, i) => (
										<div
											key={i}
											className="flex items-center justify-between px-4 py-2.5 text-sm"
										>
											<span className="text-gray-700 dark:text-gray-300 truncate me-4">
												{r.folderName}
											</span>
											<div className="flex-shrink-0">
												{r.status === "success" ? (
													<span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
														<CheckCircle className="w-3.5 h-3.5" />{" "}
														{t("common.done")}
													</span>
												) : (
													<span
														className="flex items-center gap-1 text-xs text-red-500 font-medium"
														title={r.message}
													>
														<XCircle className="w-3.5 h-3.5" />{" "}
														{t("students.failed")}
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				{/* ── PHASE: DONE ───────────────────────────────────────────────── */}
				{phase === "done" && (
					<div className="max-w-lg mx-auto text-center space-y-6 py-10">
						<div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
							<CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
								{t("students.importComplete")}
							</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{failures > 0
									? t("students.importCompleteDescWithFailed", {
											successes,
											total,
											failures,
										})
									: t("students.importCompleteDesc", { successes, total })}
							</p>
						</div>

						<div className="grid grid-cols-3 gap-3 text-start">
							<div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-gray-900 dark:text-white">
									{total}
								</div>
								<div className="text-xs text-gray-500 mt-0.5">
									{t("students.total")}
								</div>
							</div>
							<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">
									{successes}
								</div>
								<div className="text-xs text-gray-500 mt-0.5">
									{t("students.succeeded")}
								</div>
							</div>
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-red-500 dark:text-red-400">
									{failures}
								</div>
								<div className="text-xs text-gray-500 mt-0.5">
									{t("students.failed")}
								</div>
							</div>
						</div>

						{failures > 0 && (
							<div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 text-start overflow-hidden">
								<p className="text-xs font-semibold text-red-600 dark:text-red-400 px-4 py-2 border-b border-red-100 dark:border-red-800 uppercase tracking-wide">
									{t("students.failedImports")}
								</p>
								<div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-48 overflow-y-auto">
									{results
										.filter((r) => r.status === "error")
										.map((r, i) => (
											<div key={i} className="px-4 py-2.5">
												<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
													{r.folderName}
												</p>
												{r.message && (
													<p className="text-xs text-gray-500 mt-0.5">
														{r.message}
													</p>
												)}
											</div>
										))}
								</div>
							</div>
						)}

						<div className="flex gap-3 justify-center">
							<Button
								variant="outline"
								onClick={() => {
									setPhase("setup");
									setDropped([]);
									setStudents([]);
									setResults([]);
								}}
							>
								{t("students.importMore")}
							</Button>
							<Button
								className="bg-gray-900 hover:bg-gray-800 text-white"
								onClick={() => router.push("/students")}
							>
								{t("common.done")}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AddInBulk;
