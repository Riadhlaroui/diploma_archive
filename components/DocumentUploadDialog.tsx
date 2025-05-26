import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { Separator } from "./ui/separator";

//Here is where call the function to upload the document
//TODO: Implement the actual upload logic in the onUpload function

interface DocumentItem {
	file: File;
	type: string;
}

interface DocumentUploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpload: (files: File[]) => void;
	existingFiles?: File[];
}

export default function DocumentUploadDialog({
	open,
	onOpenChange,
	onUpload,
	existingFiles = [],
}: DocumentUploadDialogProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const [fileItems, setFileItems] = useState<DocumentItem[]>(
		existingFiles.map((file) => ({ file, type: "Birth Certificate" }))
	);

	const [documentTypes, setDocumentTypes] = useState([
		"Birth Certificate",
		"BAC",
		"National ID",
		"Enrollment Certificate",
	]);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [newTypeName, setNewTypeName] = useState("");

	const handleFiles = (files: FileList | null) => {
		if (!files) return;
		const newItems = Array.from(files).map((file) => ({
			file,
			type: documentTypes[0],
		}));
		setFileItems((prev) => [...prev, ...newItems]);
	};

	const updateType = (index: number, type: string) => {
		if (type === "__new__") {
			setEditingIndex(index);
		} else {
			setFileItems((prev) =>
				prev.map((item, i) => (i === index ? { ...item, type } : item))
			);
		}
	};

	const confirmNewType = () => {
		if (!newTypeName.trim() || editingIndex === null) return;
		if (!documentTypes.includes(newTypeName)) {
			setDocumentTypes((prev) => [...prev, newTypeName]);
		}
		setFileItems((prev) =>
			prev.map((item, i) =>
				i === editingIndex ? { ...item, type: newTypeName } : item
			)
		);
		setNewTypeName("");
		setEditingIndex(null);
	};

	const removeFile = (index: number) => {
		setFileItems((prev) => prev.filter((_, i) => i !== index));
	};

	const closeDialog = () => onOpenChange(false);

	const confirmUpload = () => {
		onUpload(fileItems.map((item) => item.file));
		closeDialog();
		//call the function to upload the document
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white dark:bg-gray-900 rounded-[3px] shadow-xl w-full max-w-lg p-6 relative">
				{/* Close Button */}
				<button
					onClick={closeDialog}
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
				>
					<X className="w-5 h-5" />
				</button>

				<h2 className="text-lg font-semibold mb-2">Upload Documents</h2>

				<Separator className="mb-2.5" />

				{/* Drop Zone */}
				<div
					onClick={() => inputRef.current?.click()}
					onDrop={(e) => {
						e.preventDefault();
						handleFiles(e.dataTransfer.files);
					}}
					onDragOver={(e) => e.preventDefault()}
					className="w-full h-24 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-600 dark:text-white bg-[#f0f4f8] dark:bg-gray-800 cursor-pointer mb-4"
				>
					<p>Click or drag and drop PDF files here</p>
					<input
						ref={inputRef}
						type="file"
						accept="application/pdf"
						multiple
						className="hidden"
						onChange={(e) => handleFiles(e.target.files)}
					/>
				</div>

				{/* File List */}
				<ul className="space-y-2 max-h-60 overflow-y-auto">
					{fileItems.map((item, index) => (
						<li
							key={index}
							className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded"
						>
							<div className="flex flex-col w-full">
								<span className="text-sm truncate">{item.file.name}</span>

								{editingIndex === index ? (
									<div className="flex gap-2 mt-1">
										<input
											type="text"
											className="p-1 text-sm border rounded w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
											placeholder="New document type"
											value={newTypeName}
											onChange={(e) => setNewTypeName(e.target.value)}
										/>
										<button
											onClick={confirmNewType}
											className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
										>
											Save
										</button>
									</div>
								) : (
									<select
										className="mt-1 text-sm p-1 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
										value={item.type}
										onChange={(e) => updateType(index, e.target.value)}
									>
										{documentTypes.map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
										<option value="__new__">+ Create new type</option>
									</select>
								)}
							</div>

							<button
								onClick={() => removeFile(index)}
								className="text-red-500 hover:text-red-700"
							>
								<X className="w-4 h-4" />
							</button>
						</li>
					))}
				</ul>

				<Separator className="mt-2.5" />

				{/* Action Buttons */}
				<div className="mt-6 flex justify-end space-x-2">
					<button
						onClick={closeDialog}
						className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-sm"
					>
						Cancel
					</button>
					<button
						onClick={confirmUpload}
						disabled={fileItems.length === 0}
						className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
}
