import React, { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Separator } from "./ui/separator";

interface DocumentItem {
	file: File;
	type: string; // Document type e.g. BAC
}

interface DocumentUploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (documents: DocumentItem[]) => void;
}

const predefinedTypes = [
	"Birth Certificate",
	"BAC",
	"National ID",
	"Enrollment Certificate",
];

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
	open,
	onOpenChange,
	onConfirm,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [documents, setDocuments] = useState<DocumentItem[]>([]);
	const [types, setTypes] = useState(predefinedTypes);
	const [newType, setNewType] = useState("");
	const [addingType, setAddingType] = useState(false);
	const [dragActive, setDragActive] = useState(false);

	// Add files to documents state
	const addFiles = useCallback((files: FileList) => {
		const newDocs: DocumentItem[] = Array.from(files).map((file) => ({
			file,
			type: "",
		}));
		setDocuments((prev) => [...prev, ...newDocs]);
	}, []);

	const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		addFiles(e.target.files);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	// Drag and Drop handlers
	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragActive(true);
	};

	const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragActive(false);
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			addFiles(e.dataTransfer.files);
			e.dataTransfer.clearData();
		}
	};

	const setDocumentType = (index: number, type: string) => {
		setDocuments((prev) => {
			const copy = [...prev];
			copy[index].type = type;
			return copy;
		});
	};

	const removeDocument = (index: number) => {
		setDocuments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleConfirm = () => {
		if (documents.some((doc) => doc.type.trim() === "")) {
			alert("Please specify a type for all documents");
			return;
		}
		onConfirm(documents);
		setDocuments([]);
		onOpenChange(false);
	};

	const addNewType = () => {
		const trimmed = newType.trim();
		if (!trimmed) return;
		if (types.includes(trimmed)) {
			alert("This type already exists");
			return;
		}
		setTypes((prev) => [...prev, trimmed]);
		setNewType("");
		setAddingType(false);
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="bg-white dark:bg-gray-900 rounded shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-auto">
				<h3 className="text-xl font-semibold mb-4">Upload Documents</h3>

				{/* Drag and drop area */}
				<div
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
					onClick={() => fileInputRef.current?.click()}
					className={`mb-4 cursor-pointer border-2 rounded border-dashed flex flex-col items-center justify-center p-10 text-center select-none
            ${
							dragActive
								? "border-blue-600 bg-blue-50 dark:bg-blue-900"
								: "border-gray-300 dark:border-gray-700 bg-transparent"
						}
            hover:border-blue-600 dark:hover:border-blue-400 transition-colors`}
				>
					<p className="text-gray-600 dark:text-gray-300 mb-2">
						Drag & drop files here, or click to select
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Supported formats: pdf, png, jpg, jpeg, doc, docx
					</p>
					<input
						type="file"
						multiple
						ref={fileInputRef}
						onChange={onFilesSelected}
						accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
						className="hidden"
					/>
				</div>

				{documents.length > 0 && (
					<ul className="space-y-3 max-h-64 overflow-auto">
						{documents.map((doc, idx) => (
							<li
								key={idx}
								className="flex items-center justify-between border p-3 rounded shadow-sm"
							>
								<div className="flex flex-col w-full">
									<span className="truncate font-medium text-gray-800 dark:text-gray-200">
										📄 {doc.file.name}
									</span>

									<select
										className="mt-1 rounded border px-3 py-1 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
										value={doc.type}
										onChange={(e) => setDocumentType(idx, e.target.value)}
									>
										<option value="" disabled>
											Select document type
										</option>
										{types.map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
									</select>
								</div>

								<button
									onClick={() => removeDocument(idx)}
									className="ml-4 text-red-600 hover:text-red-900"
									aria-label={`Remove ${doc.file.name}`}
									type="button"
								>
									<X className="w-5 h-5" />
								</button>
							</li>
						))}
					</ul>
				)}

				<Separator className="my-5" />

				{/* Add new document type section */}
				<div className="mb-4">
					{!addingType ? (
						<button
							type="button"
							onClick={() => setAddingType(true)}
							className="text-sm text-blue-600 hover:underline"
						>
							+ Add new document type
						</button>
					) : (
						<div className="flex items-center gap-2">
							<input
								type="text"
								placeholder="New type name"
								className="rounded border px-3 py-1 flex-grow dark:bg-gray-800 dark:text-gray-100"
								value={newType}
								onChange={(e) => setNewType(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addNewType();
									} else if (e.key === "Escape") {
										setAddingType(false);
										setNewType("");
									}
								}}
							/>
							<button
								type="button"
								onClick={addNewType}
								className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
							>
								Add
							</button>
							<button
								type="button"
								onClick={() => {
									setAddingType(false);
									setNewType("");
								}}
								className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
							>
								Cancel
							</button>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={() => {
							setDocuments([]);
							onOpenChange(false);
						}}
						className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={documents.length === 0}
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};

export default DocumentUploadDialog;
