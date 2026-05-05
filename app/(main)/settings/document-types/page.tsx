"use client";

import { useEffect, useState } from "react";
import {
	Plus,
	Pencil,
	Trash2,
	Check,
	X,
	FileText,
	ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
	getAllDocumentTypes,
	addDocumentType,
	deleteDocumentType,
	updateDocumentType,
	type DocumentTypeList,
} from "@/app/src/services/documentTypesServices";

export default function DocumentTypesPage() {
	const { t } = useTranslation();
	const router = useRouter();

	const [types, setTypes] = useState<DocumentTypeList[]>([]);
	const [loading, setLoading] = useState(true);

	// add state
	const [newName, setNewName] = useState("");
	const [adding, setAdding] = useState(false);
	const [savingNew, setSavingNew] = useState(false);

	// edit state
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState("");
	const [savingEdit, setSavingEdit] = useState(false);

	// delete state
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		fetchTypes();
	}, []);

	const fetchTypes = async () => {
		try {
			setLoading(true);
			const data = await getAllDocumentTypes();
			setTypes(data);
		} catch {
			toast.error("Failed to load document types");
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = async () => {
		const trimmed = newName.trim();
		if (!trimmed) return;
		if (types.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
			toast.warning("A type with this name already exists");
			return;
		}
		try {
			setSavingNew(true);
			const created = await addDocumentType(trimmed);
			setTypes((prev) =>
				[
					...prev,
					{
						id: created.id,
						name: created.name,
						createdAt: created.created,
						updatedAt: created.updated,
					},
				].sort((a, b) => a.name.localeCompare(b.name)),
			);
			setNewName("");
			setAdding(false);
			toast.success(`"${trimmed}" added`);
		} catch {
			toast.error("Failed to add document type");
		} finally {
			setSavingNew(false);
		}
	};

	const handleEdit = async (id: string) => {
		const trimmed = editingName.trim();
		if (!trimmed) return;
		if (
			types.some(
				(t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== id,
			)
		) {
			toast.warning("A type with this name already exists");
			return;
		}
		try {
			setSavingEdit(true);
			await updateDocumentType(id, { name: trimmed });
			setTypes((prev) =>
				prev
					.map((t) => (t.id === id ? { ...t, name: trimmed } : t))
					.sort((a, b) => a.name.localeCompare(b.name)),
			);
			setEditingId(null);
			toast.success("Type updated");
		} catch {
			toast.error("Failed to update document type");
		} finally {
			setSavingEdit(false);
		}
	};

	const handleDelete = async (id: string, name: string) => {
		// check if used — optional: you could query Archive_files with this typeId first
		try {
			setDeletingId(id);
			await deleteDocumentType(id);
			setTypes((prev) => prev.filter((t) => t.id !== id));
			toast.success(`"${name}" deleted`);
		} catch {
			toast.error(
				"Failed to delete — this type may be in use by existing documents",
			);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="min-h-full p-6">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<button
						onClick={() => router.back()}
						className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						{t("common.back")}
					</button>
					<h1 className="text-xl font-semibold text-gray-900">
						{t("settings.documentSettings.title")}
					</h1>
					<p className="text-sm text-gray-500 mt-1">
						{t("settings.documentSettings.description")}
					</p>
				</div>

				{/* Card */}
				<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
					{/* Card header */}
					<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
						<div className="flex items-center gap-2">
							<FileText className="w-4 h-4 text-gray-400" />
							<span className="text-sm font-medium text-gray-700">
								{types.length} type{types.length !== 1 ? "s" : ""}
							</span>
						</div>
						{!adding && (
							<button
								onClick={() => setAdding(true)}
								className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 rounded-lg px-3 h-8 transition-colors"
							>
								<Plus className="w-3.5 h-3.5" />
								{t("settings.documentSettings.addType")}
							</button>
						)}
					</div>

					{/* Add new row */}
					{adding && (
						<div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
							<input
								type="text"
								autoFocus
								placeholder={t("settings.documentSettings.typeNamePlaceholder")}
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleAdd();
									if (e.key === "Escape") {
										setAdding(false);
										setNewName("");
									}
								}}
								className="flex-1 h-8 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 bg-white"
							/>
							<button
								onClick={handleAdd}
								disabled={savingNew || !newName.trim()}
								className="h-8 px-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
							>
								{savingNew ? t("common.saving") : t("common.save")}
							</button>
							<button
								onClick={() => {
									setAdding(false);
									setNewName("");
								}}
								className="h-8 px-3 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
							>
								{t("common.cancel")}
							</button>
						</div>
					)}

					{/* List */}
					{loading ? (
						<div className="py-12 text-center text-sm text-gray-400">
							{t("common.loading")}
						</div>
					) : types.length === 0 && !adding ? (
						<div className="py-12 text-center">
							<div className="w-10 h-10 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
								<FileText className="w-5 h-5 text-gray-400" />
							</div>
							<p className="text-sm text-gray-500">
								{t("settings.documentSettings.noDocumentTypes")}
							</p>
							<button
								onClick={() => setAdding(true)}
								className="mt-3 text-sm font-medium text-gray-700 hover:text-black underline underline-offset-2"
							>
								{t("settings.documentSettings.addYourFirstType")}
							</button>
						</div>
					) : (
						<ul className="divide-y divide-gray-100">
							{types.map((type) => (
								<li
									key={type.id}
									className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group transition-colors"
								>
									{editingId === type.id ? (
										<>
											<input
												autoFocus
												type="text"
												value={editingName}
												onChange={(e) => setEditingName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleEdit(type.id);
													if (e.key === "Escape") setEditingId(null);
												}}
												className="flex-1 h-8 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 bg-white"
											/>
											<button
												onClick={() => handleEdit(type.id)}
												disabled={savingEdit}
												className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
											>
												<Check className="w-4 h-4" />
											</button>
											<button
												onClick={() => setEditingId(null)}
												className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
											>
												<X className="w-4 h-4" />
											</button>
										</>
									) : (
										<>
											<div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
											<span className="flex-1 text-sm text-gray-800">
												{type.name}
											</span>
											<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() => {
														setEditingId(type.id);
														setEditingName(type.name);
													}}
													className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
													title="Rename"
												>
													<Pencil className="w-3.5 h-3.5" />
												</button>
												<button
													onClick={() => handleDelete(type.id, type.name)}
													disabled={deletingId === type.id}
													className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
													title="Delete"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										</>
									)}
								</li>
							))}
						</ul>
					)}
				</div>

				<p className="mt-3 text-xs text-gray-400">
					{t("settings.documentSettings.documentTypesNote")}
				</p>
			</div>
		</div>
	);
}
