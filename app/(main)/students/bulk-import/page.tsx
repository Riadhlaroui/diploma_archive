/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
	ArrowLeft,
	FolderOpen,
	CheckCircle,
	XCircle,
	AlertCircle,
	Loader2,
	RefreshCw,
	Download,
	Pause,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import pb from "@/lib/pocketbase";
import { createStudentWithDocuments } from "@/app/src/services/studentService";
import { toast } from "sonner";

import { ocrRateLimiter } from "@/lib/utils/rateLimiter";

// TYPES

type Phase = "setup" | "processing" | "reviewing" | "importing" | "done";
type ItemStatus = "queued" | "processing" | "done" | "error";

interface DroppedFolder {
	id: string;
	name: string;
	files: File[];
}

interface StudentDraft {
	folderId: string;
	folderName: string;
	files: File[];
	// OCR-extracted fields (editable)
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	enrollmentYear: string;
	graduationYear: string;
	// meta
	status: ItemStatus;
	errorMsg: string;
	skip: boolean;
}

interface BatchConfig {
	facultyId: string;
	departmentId: string;
	fieldId: string;
	majorId: string;
	specialtyId: string;
	defaultDocTypeId: string;
	concurrency: number;
}

interface ImportResult {
	folderId: string;
	folderName: string;
	matricule: string;
	status: "success" | "error" | "skipped";
	message: string;
}

// HELPERS

const SUPPORTED_EXTS = ["jpg", "jpeg", "png", "webp", "pdf"];
const BATCH_SIZE = 5;

async function readDirEntry(
	dirEntry: FileSystemDirectoryEntry,
): Promise<File[]> {
	const files: File[] = [];

	const readBatch = (
		reader: FileSystemDirectoryReader,
	): Promise<FileSystemEntry[]> =>
		new Promise((res, rej) => reader.readEntries(res, rej));

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

async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve((reader.result as string).split(",")[1]);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function getMediaType(file: File): string {
	if (file.type) return file.type;
	const ext = file.name.split(".").pop()?.toLowerCase();
	const map: Record<string, string> = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		webp: "image/webp",
		pdf: "application/pdf",
	};
	return map[ext ?? ""] ?? "application/octet-stream";
}

async function ocrFolder(files: File[]): Promise<Partial<StudentDraft>> {
	if (files.length === 0) throw new Error("No files in folder");

	const batches: File[][] = [];
	for (let i = 0; i < files.length; i += BATCH_SIZE) {
		batches.push(files.slice(i, i + BATCH_SIZE));
	}

	console.group(
		`📁 OCR — ${files.length} file(s) across ${batches.length} batch(es)`,
	);
	console.log(
		"Files:",
		files.map((f) => f.name),
	);

	const results: Partial<StudentDraft>[] = [];

	for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
		const batch = batches[batchIdx];
		console.group(
			`  📦 Batch ${batchIdx + 1}/${batches.length} — ${batch.length} file(s): [${batch.map((f) => f.name).join(", ")}]`,
		);

		console.log("  ⏳ Waiting for rate limiter slot…");
		await ocrRateLimiter.acquire();
		console.log("  ✅ Rate limiter acquired — sending request");

		let payload: { data: string; mediaType: string }[];
		try {
			payload = await Promise.all(
				batch.map(async (f) => ({
					data: await fileToBase64(f),
					mediaType: getMediaType(f),
				})),
			);
			console.log("  🔄 Files encoded to base64");
		} catch (encodeErr) {
			console.error("  ❌ Failed to encode files:", encodeErr);
			console.groupEnd();
			continue;
		}

		let res: Response;
		try {
			res = await fetch("/api/ocr-gemini", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ files: payload }),
			});
		} catch (networkErr) {
			console.error("  ❌ Network error calling OCR route:", networkErr);
			console.groupEnd();
			continue;
		}

		if (!res.ok) {
			const err = await res.json().catch(() => ({ error: res.statusText }));
			console.warn(
				`  ⚠️ Batch ${batchIdx + 1} failed — HTTP ${res.status}:`,
				err.error,
			);
			console.groupEnd();
			continue;
		}

		const parsed = await res.json();
		console.log(`  📄 Raw response from Gemini:`, parsed);

		const result: Partial<StudentDraft> = {
			matricule: parsed.matricule ?? "",
			firstName: parsed.firstName ?? "",
			lastName: parsed.lastName ?? "",
			dateOfBirth: parsed.dateOfBirth ?? "",
			enrollmentYear: String(parsed.enrollmentYear ?? ""),
			graduationYear: String(parsed.graduationYear ?? ""),
		};

		// Log which fields this batch found vs missed
		const found = Object.entries(result)
			.filter(([, v]) => v && v !== "null")
			.map(([k]) => k);
		const missed = Object.entries(result)
			.filter(([, v]) => !v || v === "null")
			.map(([k]) => k);
		console.log("  ✅ Found:  ", found.length ? found.join(", ") : "none");
		console.log("  ❓ Missing:", missed.length ? missed.join(", ") : "none");

		results.push(result);
		console.groupEnd();
	}

	console.log(`\n📊 ${results.length}/${batches.length} batches succeeded`);

	if (results.length === 0) {
		console.error("❌ All batches failed — no data extracted");
		console.groupEnd();
		throw new Error("All OCR batches failed — no data extracted");
	}

	const merged = mergeOcrResults(results);
	console.log("🔀 Merged result:", merged);

	const stillMissing = Object.entries(merged)
		.filter(([, v]) => !v || v === "null")
		.map(([k]) => k);

	if (stillMissing.length > 0) {
		console.warn("⚠️  Still missing after merge:", stillMissing.join(", "));
	} else {
		console.log("✅ All fields found");
	}

	console.groupEnd();
	return merged;
}

function mergeOcrResults(
	results: Partial<StudentDraft>[],
): Partial<StudentDraft> {
	const fields = [
		"matricule",
		"firstName",
		"lastName",
		"dateOfBirth",
		"enrollmentYear",
		"graduationYear",
	] as const;

	const merged: Partial<StudentDraft> = {};

	for (const field of fields) {
		for (let i = 0; i < results.length; i++) {
			const val = results[i][field];
			if (val && String(val).trim() !== "" && val !== "null") {
				merged[field] = val;
				if (results.length > 1) {
					console.log(`  🔀 "${field}" taken from batch ${i + 1}: "${val}"`);
				}
				break;
			}
		}
		if (!merged[field]) merged[field] = "";
	}

	return merged;
}

const REQUIRED_FIELDS: { key: keyof StudentDraft; label: string }[] = [
	{ key: "matricule", label: "Matricule" },
	{ key: "firstName", label: "First Name" },
	{ key: "lastName", label: "Last Name" },
	{ key: "dateOfBirth", label: "Date of Birth" },
	{ key: "enrollmentYear", label: "Enrollment Year" },
	{ key: "graduationYear", label: "Graduation Year" },
];

function getMissingFields(d: StudentDraft): string[] {
	const missing = REQUIRED_FIELDS.filter(({ key }) => !d[key]).map(
		({ label }) => label,
	);

	if (d.files.length === 0) missing.push("Documents");

	return missing;
}

function isMissingRequired(d: StudentDraft): boolean {
	return getMissingFields(d).length > 0;
}

function formatEta(ms: number): string {
	if (!isFinite(ms) || ms <= 0) return "calculating…";
	const s = Math.round(ms / 1000);
	if (s < 60) return `~${s}s`;
	const m = Math.round(s / 60);
	if (m < 60) return `~${m}m`;
	const h = (s / 3600).toFixed(1);
	return `~${h}h`;
}

const BulkImportPage: React.FC = () => {
	const { t } = useTranslation();
	const router = useRouter();

	// phases
	const [phase, setPhase] = useState<Phase>("setup");

	// PocketBase data
	const [faculties, setFaculties] = useState<any[]>([]);
	const [departments, setDepartments] = useState<any[]>([]);
	const [fields, setFields] = useState<any[]>([]);
	const [majors, setMajors] = useState<any[]>([]);
	const [specialties, setSpecialties] = useState<any[]>([]);
	const [docTypes, setDocTypes] = useState<any[]>([]);

	// batch config
	const [config, setConfig] = useState<BatchConfig>({
		facultyId: "",
		departmentId: "",
		fieldId: "",
		majorId: "",
		specialtyId: "",
		defaultDocTypeId: "",
		concurrency: 1,
	});

	// drag & drop
	const [isDragging, setIsDragging] = useState(false);
	const [dropped, setDropped] = useState<DroppedFolder[]>([]);

	// OCR state
	const [drafts, setDrafts] = useState<StudentDraft[]>([]);
	const [processedCount, setProcessedCount] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const pausedRef = useRef(false);
	const cancelRef = useRef(false);
	const startTimeRef = useRef<number>(0);

	// review filters / pagination
	const [reviewFilter, setReviewFilter] = useState<
		"all" | "missing" | "errors"
	>("all");
	const [reviewPage, setReviewPage] = useState(0);
	const PAGE_SIZE = 50;

	// import state
	const [importResults, setImportResults] = useState<ImportResult[]>([]);
	const [importDone, setImportDone] = useState(0);

	// Initial loads
	useEffect(() => {
		pb.collection("Archive_faculties").getFullList().then(setFaculties);
		pb.collection("Document_types").getFullList().then(setDocTypes);
	}, []);

	// Cascade selects
	useEffect(() => {
		if (config.facultyId) {
			pb.collection("Archive_departments")
				.getFullList({ filter: `facultyId="${config.facultyId}"` })
				.then(setDepartments);
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
				.then(setFields);
		} else setFields([]);
		setConfig((c) => ({ ...c, fieldId: "", majorId: "", specialtyId: "" }));
		setMajors([]);
		setSpecialties([]);
	}, [config.departmentId]);

	useEffect(() => {
		if (config.fieldId) {
			pb.collection("Archive_majors")
				.getFullList({ filter: `fieldId="${config.fieldId}"` })
				.then(setMajors);
		} else setMajors([]);
		setConfig((c) => ({ ...c, majorId: "", specialtyId: "" }));
		setSpecialties([]);
	}, [config.fieldId]);

	useEffect(() => {
		if (config.majorId) {
			pb.collection("Archive_specialties")
				.getFullList({ filter: `majorId="${config.majorId}"` })
				.then(setSpecialties);
		} else setSpecialties([]);
		setConfig((c) => ({ ...c, specialtyId: "" }));
	}, [config.majorId]);

	// Drag & Drop
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => setIsDragging(false), []);

	const handleDrop = useCallback(async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const items = Array.from(e.dataTransfer.items);
		const newFolders: DroppedFolder[] = [];

		for (const item of items) {
			if (item.kind !== "file") continue;
			const entry = item.webkitGetAsEntry();
			if (!entry?.isDirectory) continue;
			try {
				const files = await readDirEntry(entry as FileSystemDirectoryEntry);
				if (files.length > 0)
					newFolders.push({
						id: `${Date.now()}-${Math.random()}`,
						name: entry.name,
						files,
					});
			} catch (err) {
				console.error("Error reading folder:", entry.name, err);
			}
		}

		if (newFolders.length) {
			setDropped((prev) => {
				const existingNames = new Set(prev.map((f) => f.name));
				const unique = newFolders.filter((f) => !existingNames.has(f.name));
				if (unique.length < newFolders.length)
					toast.warning(
						`${newFolders.length - unique.length} duplicate folder(s) skipped`,
					);
				toast.success(`Added ${unique.length} folder(s)`);
				return [...prev, ...unique];
			});
		}
	}, []);

	const canStart =
		dropped.length > 0 &&
		!!config.fieldId &&
		!!config.majorId &&
		!!config.specialtyId &&
		!!config.defaultDocTypeId;

	const startProcessing = async () => {
		cancelRef.current = false;
		pausedRef.current = false;
		setIsPaused(false);
		setProcessedCount(0);
		startTimeRef.current = Date.now();

		const initial: StudentDraft[] = dropped.map((f) => ({
			folderId: f.id,
			folderName: f.name,
			files: f.files,
			matricule: "",
			firstName: "",
			lastName: "",
			dateOfBirth: "",
			enrollmentYear: "",
			graduationYear: "",
			status: "queued",
			errorMsg: "",
			skip: false,
		}));

		setDrafts(initial);
		setPhase("processing");

		// Concurrency pool
		let cursor = 0;
		let done = 0;
		const total = initial.length;
		const concurrency = config.concurrency;

		await new Promise<void>((resolve) => {
			const launch = () => {
				if (done >= total) {
					resolve();
					return;
				}

				// Wait while paused
				if (pausedRef.current) {
					setTimeout(launch, 300);
					return;
				}

				const inFlight = cursor - done;
				while (cursor < total && inFlight < concurrency) {
					if (cancelRef.current) {
						resolve();
						return;
					}
					const idx = cursor++;
					const draft = initial[idx];

					setDrafts((prev) =>
						prev.map((d, i) =>
							i === idx ? { ...d, status: "processing" } : d,
						),
					);

					ocrFolder(draft.files)
						.then((extracted) => {
							setDrafts((prev) =>
								prev.map((d, i) =>
									i === idx ? { ...d, ...extracted, status: "done" } : d,
								),
							);
						})
						.catch((err: Error) => {
							setDrafts((prev) =>
								prev.map((d, i) =>
									i === idx
										? { ...d, status: "error", errorMsg: err.message }
										: d,
								),
							);
						})
						.finally(() => {
							done++;
							setProcessedCount(done);
							launch();
						});
				}
			};
			launch();
		});

		if (!cancelRef.current) setPhase("reviewing");
	};

	// Retry single folder
	const retryOcr = async (folderId: string) => {
		const draft = drafts.find((d) => d.folderId === folderId);
		if (!draft) return;
		setDrafts((prev) =>
			prev.map((d) =>
				d.folderId === folderId
					? { ...d, status: "processing", errorMsg: "" }
					: d,
			),
		);
		try {
			const extracted = await ocrFolder(draft.files);
			setDrafts((prev) =>
				prev.map((d) =>
					d.folderId === folderId ? { ...d, ...extracted, status: "done" } : d,
				),
			);
		} catch (err: any) {
			setDrafts((prev) =>
				prev.map((d) =>
					d.folderId === folderId
						? { ...d, status: "error", errorMsg: err.message }
						: d,
				),
			);
		}
	};

	// Start Import
	const toImport = drafts.filter(
		(d) => !d.skip && d.status === "done" && getMissingFields(d).length === 0,
	);

	const startImport = async () => {
		setImportResults([]);
		setImportDone(0);
		setPhase("importing");

		const results: ImportResult[] = [];
		let concCursor = 0;
		let concDone = 0;
		const total = toImport.length;
		const IMPORT_CONCURRENCY = 2; // conservative for DB writes

		await new Promise<void>((resolve) => {
			const launch = () => {
				if (concDone >= total) {
					resolve();
					return;
				}
				while (
					concCursor < total &&
					concCursor - concDone < IMPORT_CONCURRENCY
				) {
					const idx = concCursor++;
					const draft = toImport[idx];

					(async () => {
						try {
							const formData = {
								matricule: draft.matricule,
								firstName: draft.firstName,
								lastName: draft.lastName,
								dateOfBirth: draft.dateOfBirth,
								enrollmentYear: draft.enrollmentYear,
								graduationYear: draft.graduationYear,
								specialtyId: config.specialtyId,
								fieldId: config.fieldId,
								majorId: config.majorId,
								file: null,
							};
							const docs = draft.files.map((file) => ({
								file,
								fileType: config.defaultDocTypeId,
							}));
							const result = await createStudentWithDocuments(formData, docs);
							results.push({
								folderId: draft.folderId,
								folderName: draft.folderName,
								matricule: draft.matricule,
								status: result?.error ? "error" : "success",
								message: result?.error ? "Already exists" : "Created",
							});
						} catch (err: any) {
							results.push({
								folderId: draft.folderId,
								folderName: draft.folderName,
								matricule: draft.matricule,
								status: "error",
								message: err.message ?? "Unknown error",
							});
						}
					})().finally(() => {
						concDone++;
						setImportDone(concDone);
						setImportResults([...results]);
						launch();
					});
				}
			};
			launch();
		});

		setImportResults(results);
		setPhase("done");
	};

	// Review table helpers
	const updateDraft = (
		folderId: string,
		field: keyof StudentDraft,
		value: string | boolean,
	) => {
		setDrafts((prev) =>
			prev.map((d) => (d.folderId === folderId ? { ...d, [field]: value } : d)),
		);
	};

	const filteredDrafts = drafts.filter((d) => {
		if (reviewFilter === "missing")
			return d.status === "done" && isMissingRequired(d);
		if (reviewFilter === "errors") return d.status === "error";
		return true;
	});
	const pageCount = Math.ceil(filteredDrafts.length / PAGE_SIZE);
	const pageDrafts = filteredDrafts.slice(
		reviewPage * PAGE_SIZE,
		(reviewPage + 1) * PAGE_SIZE,
	);

	// ETA calculation
	const etaMs =
		processedCount > 0
			? ((Date.now() - startTimeRef.current) / processedCount) *
				(drafts.length - processedCount)
			: Infinity;

	// CSV export
	const downloadErrors = () => {
		const lines = [
			"Folder,Matricule,Error",
			...importResults
				.filter((r) => r.status === "error")
				.map((r) => `"${r.folderName}","${r.matricule}","${r.message}"`),
		];
		const blob = new Blob([lines.join("\n")], { type: "text/csv" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `import-errors-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
	};

	// RENDER

	return (
		<div className="min-h-full dark:bg-gray-900 p-4">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<button
						onClick={() => router.back()}
						className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:underline transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						{t("common.back")}
					</button>
					<h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
						Bulk Import Students — OCR
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Drop student folders. Claude Vision extracts data automatically,
						then you review before importing.
					</p>
				</div>

				{phase === "setup" && (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left — drop zone + folder list */}
						<div className="lg:col-span-2 space-y-4">
							{/* Drop zone */}
							<div
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								className={`rounded-lg border-2 border-dashed p-14 text-center transition-all select-none ${
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
										? "Release to add folders"
										: "Drag & drop student folders here"}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Each folder = one student · supports JPG, PNG, WEBP, PDF
								</p>
							</div>

							{/* Folder list */}
							{dropped.length > 0 && (
								<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
									<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
										<span className="text-sm font-medium text-gray-900 dark:text-white">
											{dropped.length.toLocaleString()} folder
											{dropped.length !== 1 ? "s" : ""} queued
										</span>
										<button
											onClick={() => setDropped([])}
											className="text-xs text-red-500 hover:text-red-600"
										>
											Clear all
										</button>
									</div>
									<div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
										{dropped.map((f) => (
											<div
												key={f.id}
												className="flex items-center gap-3 px-4 py-2 group"
											>
												<FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
												<span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
													{f.name}
												</span>
												<span className="text-xs text-gray-400">
													{f.files.length} file{f.files.length !== 1 ? "s" : ""}
												</span>
												<button
													onClick={() =>
														setDropped((prev) =>
															prev.filter((d) => d.id !== f.id),
														)
													}
													className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-1"
												>
													<XCircle className="w-4 h-4" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Right — batch config */}
						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 space-y-4 sticky top-4 h-fit">
							<h2 className="text-sm font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
								Batch Configuration
							</h2>
							<p className="text-xs text-gray-400 -mt-2">
								Applied to every student in this batch
							</p>

							{(
								[
									{
										label: "Faculty *",
										key: "facultyId",
										list: faculties,
										disabled: false,
									},
									{
										label: "Department *",
										key: "departmentId",
										list: departments,
										disabled: !config.facultyId,
									},
									{
										label: "Field *",
										key: "fieldId",
										list: fields,
										disabled: !config.departmentId,
									},
									{
										label: "Major *",
										key: "majorId",
										list: majors,
										disabled: !config.fieldId,
									},
									{
										label: "Specialty *",
										key: "specialtyId",
										list: specialties,
										disabled: !config.majorId,
									},
								] as const
							).map(({ label, key, list, disabled }) => (
								<div key={key} className="space-y-1">
									<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
										{label}
									</label>
									<Select
										value={(config as any)[key]}
										onValueChange={(v) =>
											setConfig((c) => ({ ...c, [key]: v }))
										}
										disabled={disabled}
									>
										<SelectTrigger className="h-8 text-sm">
											<SelectValue
												placeholder={`Select ${label.replace(" *", "").toLowerCase()}`}
											/>
										</SelectTrigger>
										<SelectContent>
											{list.map((item: any) => (
												<SelectItem key={item.id} value={item.id}>
													{item.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							))}

							<div className="space-y-1">
								<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
									Default Document Type *
								</label>
								<Select
									value={config.defaultDocTypeId}
									onValueChange={(v) =>
										setConfig((c) => ({ ...c, defaultDocTypeId: v }))
									}
								>
									<SelectTrigger className="h-8 text-sm">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{docTypes.map((d: any) => (
											<SelectItem key={d.id} value={d.id}>
												{d.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5 pt-1">
								<div className="flex justify-between items-center">
									<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
										Parallel OCR requests
									</label>
									<span className="text-xs font-semibold text-gray-800 dark:text-white">
										{config.concurrency}
									</span>
								</div>
								<input
									type="range"
									min={1}
									max={10}
									value={config.concurrency}
									onChange={(e) =>
										setConfig((c) => ({ ...c, concurrency: +e.target.value }))
									}
									className="w-full h-1.5 accent-gray-900"
								/>
								<p className="text-xs text-gray-400">
									Higher = faster, but may hit API rate limits. 3–5 is safe.
								</p>
							</div>

							<Button
								onClick={startProcessing}
								disabled={!canStart}
								className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-2"
							>
								Start OCR
								{dropped.length > 0 && (
									<span className="ml-2 opacity-60 text-xs">
										({dropped.length.toLocaleString()} folders)
									</span>
								)}
							</Button>

							{dropped.length > 100 && (
								<p className="text-xs text-amber-600 dark:text-amber-400 text-center">
									⚠ Large batch — estimated{" "}
									{formatEta((dropped.length / config.concurrency) * 6000)}{" "}
									processing time
								</p>
							)}
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════════
            PHASE: PROCESSING
        ══════════════════════════════════════════════════════════════════════ */}
				{phase === "processing" && (
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-5">
						{/* Header row */}
						<div className="flex items-center gap-4">
							{isPaused ? (
								<Pause className="w-5 h-5 text-amber-500 shrink-0" />
							) : (
								<Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
							)}
							<div className="flex-1">
								<p className="text-sm font-semibold text-gray-900 dark:text-white">
									{isPaused ? "Paused" : "Extracting student data with OCR…"}
								</p>
								<p className="text-xs text-gray-500">
									{processedCount.toLocaleString()} /{" "}
									{drafts.length.toLocaleString()} completed ·{" "}
									{drafts.filter((d) => d.status === "error").length} errors ·
									ETA {formatEta(etaMs)}
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										pausedRef.current = !pausedRef.current;
										setIsPaused(pausedRef.current);
									}}
								>
									{isPaused ? (
										<>
											<Play className="w-3.5 h-3.5 mr-1" /> Resume
										</>
									) : (
										<>
											<Pause className="w-3.5 h-3.5 mr-1" /> Pause
										</>
									)}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										cancelRef.current = true;
										setPhase("reviewing");
									}}
								>
									Stop & Review
								</Button>
							</div>
						</div>

						{/* Progress bar */}
						<div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								className="h-full bg-blue-500 transition-all duration-300 rounded-full"
								style={{
									width: `${(processedCount / Math.max(1, drafts.length)) * 100}%`,
								}}
							/>
						</div>

						{/* Live log (last 200) */}
						<div className="max-h-96 overflow-y-auto rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-2 space-y-0.5">
							{drafts
								.slice()
								.reverse()
								.slice(0, 200)
								.map((d) => (
									<div
										key={d.folderId}
										className="flex items-center gap-2 px-2 py-1 rounded text-xs"
									>
										{d.status === "queued" && (
											<div className="w-3 h-3 rounded-full border-2 border-gray-300 flex-shrink-0" />
										)}
										{d.status === "processing" && (
											<Loader2 className="w-3 h-3 text-blue-400 animate-spin flex-shrink-0" />
										)}
										{d.status === "done" && (
											<CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
										)}
										{d.status === "error" && (
											<XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
										)}
										<span className="text-gray-500 dark:text-gray-400 truncate flex-1">
											{d.folderName}
										</span>
										{d.status === "done" && d.matricule && (
											<span className="text-gray-400 font-mono">
												{d.matricule}
											</span>
										)}
										{d.status === "error" && (
											<span className="text-red-400 truncate max-w-xs">
												{d.errorMsg}
											</span>
										)}
									</div>
								))}
						</div>
					</div>
				)}

				{phase === "reviewing" && (
					<div className="space-y-4">
						<div
							className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800
                    rounded-lg border border-gray-200 dark:border-gray-700 p-4"
						>
							{/* Extracted */}
							<div className="flex items-center gap-1.5">
								<CheckCircle className="w-4 h-4 text-green-500" />
								<span className="text-sm text-gray-700 dark:text-gray-300">
									<strong>
										{
											drafts.filter(
												(d) => d.status === "done" && !isMissingRequired(d),
											).length
										}
									</strong>{" "}
									ready
								</span>
							</div>

							{/* Missing fields */}
							<div className="flex items-center gap-1.5">
								<AlertCircle className="w-4 h-4 text-yellow-500" />
								<span className="text-sm text-gray-700 dark:text-gray-300">
									<strong>
										{
											drafts.filter(
												(d) => d.status === "done" && isMissingRequired(d),
											).length
										}
									</strong>{" "}
									incomplete
								</span>
							</div>

							{/* OCR errors */}
							<div className="flex items-center gap-1.5">
								<XCircle className="w-4 h-4 text-red-500" />
								<span className="text-sm text-gray-700 dark:text-gray-300">
									<strong>
										{drafts.filter((d) => d.status === "error").length}
									</strong>{" "}
									OCR failed
								</span>
							</div>

							{/* No documents */}
							{drafts.some((d) => d.files.length === 0) && (
								<div className="flex items-center gap-1.5">
									<XCircle className="w-4 h-4 text-red-600" />
									<span className="text-sm text-red-600 dark:text-red-400">
										<strong>
											{drafts.filter((d) => d.files.length === 0).length}
										</strong>{" "}
										have no documents
									</span>
								</div>
							)}

							{/* Filter toggle */}
							<div
								className="flex rounded border border-gray-200 dark:border-gray-600
                      overflow-hidden text-xs ml-auto"
							>
								{(["all", "missing", "errors"] as const).map((f) => (
									<button
										key={f}
										onClick={() => {
											setReviewFilter(f);
											setReviewPage(0);
										}}
										className={`px-3 py-1.5 capitalize transition-colors ${
											reviewFilter === f
												? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
												: "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
										}`}
									>
										{f}
									</button>
								))}
							</div>

							{/* Import button */}
							<div className="flex flex-col items-end gap-1">
								<Button
									onClick={startImport}
									disabled={toImport.length === 0}
									className="bg-gray-900 hover:bg-gray-800 text-white"
								>
									Import {toImport.length.toLocaleString()} Students
								</Button>
								{drafts.filter((d) => !d.skip && isMissingRequired(d)).length >
									0 && (
									<p className="text-xs text-amber-600 dark:text-amber-400">
										⚠{" "}
										{
											drafts.filter((d) => !d.skip && isMissingRequired(d))
												.length
										}{" "}
										incomplete record
										{drafts.filter((d) => !d.skip && isMissingRequired(d))
											.length !== 1
											? "s"
											: ""}{" "}
										will be skipped
									</p>
								)}
							</div>
						</div>

						<div
							className="bg-white dark:bg-gray-800 rounded-lg border
                    border-gray-200 dark:border-gray-700 overflow-x-auto"
						>
							<table className="w-full text-sm min-w-[960px]">
								<thead>
									<tr
										className="border-b border-gray-100 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-700/40 text-xs uppercase text-gray-500"
									>
										<th className="px-3 py-2.5 text-left w-8">#</th>
										<th className="px-3 py-2.5 text-left max-w-[110px]">
											Folder
										</th>
										<th className="px-3 py-2.5 text-left">Matricule</th>
										<th className="px-3 py-2.5 text-left">First Name</th>
										<th className="px-3 py-2.5 text-left">Last Name</th>
										<th className="px-3 py-2.5 text-left">Date of Birth</th>
										<th className="px-3 py-2.5 text-left">Enroll</th>
										<th className="px-3 py-2.5 text-left">Grad</th>
										<th className="px-3 py-2.5 text-left w-14">Docs</th>
										<th className="px-3 py-2.5 text-left">Missing</th>
										<th className="px-3 py-2.5 text-left w-24">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
									{pageDrafts.map((d, localIdx) => {
										const globalIdx = reviewPage * PAGE_SIZE + localIdx + 1;
										const missingList = getMissingFields(d);
										const hasMissing = missingList.length > 0;
										const noDocs = d.files.length === 0;

										const rowBg = d.skip
											? "opacity-40"
											: d.status === "error"
												? "bg-red-50/60 dark:bg-red-900/10"
												: hasMissing
													? "bg-yellow-50/60 dark:bg-yellow-900/10"
													: "";

										return (
											<tr
												key={d.folderId}
												className={`transition-colors ${rowBg}`}
											>
												{/* # */}
												<td className="px-3 py-1.5 text-xs text-gray-400">
													{globalIdx}
												</td>

												{/* Folder name */}
												<td className="px-3 py-1.5 max-w-[110px]">
													<span
														className="block truncate text-xs text-gray-500 dark:text-gray-400"
														title={d.folderName}
													>
														{d.folderName}
													</span>
												</td>

												{/* Editable fields — or error message spanning all */}
												{d.status === "error" ? (
													<td
														colSpan={6}
														className="px-3 py-1.5 text-xs text-red-500"
													>
														{d.errorMsg}
													</td>
												) : (
													(
														[
															"matricule",
															"firstName",
															"lastName",
															"dateOfBirth",
															"enrollmentYear",
															"graduationYear",
														] as const
													).map((field) => {
														const empty = !d[field];
														return (
															<td key={field} className="px-1 py-1">
																<input
																	value={(d[field] as string) ?? ""}
																	onChange={(e) =>
																		updateDraft(
																			d.folderId,
																			field,
																			e.target.value,
																		)
																	}
																	disabled={d.skip}
																	placeholder={
																		field === "dateOfBirth" ? "YYYY-MM-DD" : "—"
																	}
																	className={`
                            w-full h-7 px-2 text-xs rounded border
                            bg-transparent dark:text-white
                            focus:outline-none focus:ring-1 focus:ring-gray-400
                            transition-colors
                            ${
															empty
																? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
																: "border-transparent hover:border-gray-200 dark:hover:border-gray-600"
														}
                          `}
																/>
															</td>
														);
													})
												)}

												{/* Documents count */}
												<td className="px-3 py-1.5">
													<span
														className={`text-xs font-semibold font-mono ${
															noDocs
																? "text-red-500"
																: "text-gray-500 dark:text-gray-400"
														}`}
													>
														{noDocs ? (
															<span className="flex items-center gap-1">
																<XCircle className="w-3.5 h-3.5" /> 0
															</span>
														) : (
															<span className="flex items-center gap-1">
																<CheckCircle className="w-3 h-3 text-green-500" />
																{d.files.length}
															</span>
														)}
													</span>
												</td>

												{/* Missing fields badge list */}
												<td className="px-3 py-1.5 max-w-[160px]">
													{missingList.length === 0 ? (
														<span
															className="text-xs text-green-600 dark:text-green-400
                                     font-medium"
														>
															✓ Complete
														</span>
													) : (
														<div className="flex flex-wrap gap-1">
															{missingList.map((label) => (
																<span
																	key={label}
																	className="inline-block px-1.5 py-0.5 rounded text-[10px]
                                         font-medium bg-red-100 text-red-700
                                         dark:bg-red-900/40 dark:text-red-300
                                         whitespace-nowrap"
																>
																	{label}
																</span>
															))}
														</div>
													)}
												</td>

												{/* Actions */}
												<td className="px-2 py-1.5">
													<div className="flex items-center gap-1.5">
														{d.status === "error" && (
															<button
																onClick={() => retryOcr(d.folderId)}
																title="Retry OCR"
																className="p-1 text-gray-400 hover:text-blue-500 rounded"
															>
																<RefreshCw className="w-3.5 h-3.5" />
															</button>
														)}
														<button
															onClick={() =>
																updateDraft(d.folderId, "skip", !d.skip)
															}
															className={`text-xs font-medium px-2 py-0.5 rounded
                                  transition-colors ${
																		d.skip
																			? "text-blue-500 hover:text-blue-600"
																			: "text-gray-400 hover:text-red-500"
																	}`}
														>
															{d.skip ? "Include" : "Skip"}
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>

							{/* Pagination — unchanged */}
							{pageCount > 1 && (
								<div
									className="flex items-center justify-between px-4 py-3
                        border-t border-gray-100 dark:border-gray-700 text-sm"
								>
									<span className="text-xs text-gray-500">
										Page {reviewPage + 1} of {pageCount} ·{" "}
										{filteredDrafts.length.toLocaleString()} rows
									</span>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={reviewPage === 0}
											onClick={() => setReviewPage((p) => p - 1)}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											disabled={reviewPage >= pageCount - 1}
											onClick={() => setReviewPage((p) => p + 1)}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════════
            PHASE: IMPORTING
        ══════════════════════════════════════════════════════════════════════ */}
				{phase === "importing" && (
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-5">
						<div className="flex items-center gap-3">
							<Loader2 className="w-5 h-5 text-green-500 animate-spin flex-shrink-0" />
							<div>
								<p className="text-sm font-semibold text-gray-900 dark:text-white">
									Saving records to PocketBase…
								</p>
								<p className="text-xs text-gray-500">
									{importDone.toLocaleString()} /{" "}
									{toImport.length.toLocaleString()} ·{" "}
									{importResults.filter((r) => r.status === "error").length}{" "}
									errors
								</p>
							</div>
						</div>
						<div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								className="h-full bg-green-500 transition-all duration-300 rounded-full"
								style={{
									width: `${(importDone / Math.max(1, toImport.length)) * 100}%`,
								}}
							/>
						</div>
						<div className="max-h-64 overflow-y-auto rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-2 space-y-0.5 font-mono text-xs">
							{importResults
								.slice()
								.reverse()
								.slice(0, 100)
								.map((r, i) => (
									<div
										key={i}
										className={`flex gap-2 ${
											r.status === "success"
												? "text-green-600 dark:text-green-400"
												: r.status === "error"
													? "text-red-500"
													: "text-gray-400"
										}`}
									>
										<span>
											{r.status === "success"
												? "✓"
												: r.status === "error"
													? "✗"
													: "—"}
										</span>
										<span className="truncate">{r.folderName}</span>
										<span className="opacity-60">{r.matricule}</span>
										<span>{r.message}</span>
									</div>
								))}
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════════
            PHASE: DONE
        ══════════════════════════════════════════════════════════════════════ */}
				{phase === "done" && (
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-10 text-center">
						<CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
							Import Complete
						</h2>
						<div className="flex justify-center gap-10 mb-8">
							<div>
								<div className="text-3xl font-bold text-green-600">
									{importResults
										.filter((r) => r.status === "success")
										.length.toLocaleString()}
								</div>
								<div className="text-sm text-gray-500 mt-1">Created</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-red-500">
									{importResults
										.filter((r) => r.status === "error")
										.length.toLocaleString()}
								</div>
								<div className="text-sm text-gray-500 mt-1">Failed</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-gray-400">
									{importResults
										.filter((r) => r.status === "skipped")
										.length.toLocaleString()}
								</div>
								<div className="text-sm text-gray-500 mt-1">Skipped</div>
							</div>
						</div>
						<div className="flex justify-center gap-3 flex-wrap">
							{importResults.some((r) => r.status === "error") && (
								<Button variant="outline" onClick={downloadErrors}>
									<Download className="w-4 h-4 mr-2" />
									Download Error Report
								</Button>
							)}
							<Button
								variant="outline"
								onClick={() => {
									setPhase("setup");
									setDropped([]);
									setDrafts([]);
									setImportResults([]);
									setProcessedCount(0);
									setImportDone(0);
								}}
							>
								Import Another Batch
							</Button>
							<Button
								className="bg-gray-900 hover:bg-gray-800 text-white"
								onClick={() => router.push("/students")}
							>
								View Students
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default BulkImportPage;
