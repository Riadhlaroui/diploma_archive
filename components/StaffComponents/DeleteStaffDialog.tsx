"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUser, UserList } from "@/app/src/services/userService";
import { Search, ShieldUser, X, Trash2, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import ConfirmDialog from "../ConfirmDialog";
import { useTranslation } from "react-i18next";
import pb from "@/lib/pocketbase";
import { ERROR_KEYS } from "@/lib/constants/errors";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const DeleteStaffDialog = ({ open, onOpenChange }: Props) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	const currentUserId = pb.authStore.model?.id;

	const [staffList, setStaffList] = useState<UserList[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		if (open) {
			setSelectedIds([]);
			setSearchTerm("");
			fetchStaffList();
		}
	}, [open]);

	const fetchStaffList = async () => {
		try {
			setFetching(true);
			const users = await getUsers();
			setStaffList(users);
		} catch (err) {
			console.error(err);
			toast.error(t(ERROR_KEYS.FETCH_STAFF_FAILED));
		} finally {
			setFetching(false);
		}
	};

	const toggleCheck = (id: string) => {
		// Prevent selecting self
		if (id === currentUserId) return;
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const toggleAll = () => {
		const selectable = filteredStaff
			.filter((u) => u.id !== currentUserId)
			.map((u) => u.id);

		if (selectable.every((id) => selectedIds.includes(id))) {
			setSelectedIds([]);
		} else {
			setSelectedIds(selectable);
		}
	};

	const handleDelete = async () => {
		if (selectedIds.length === 0) return;
		setLoading(true);
		let successCount = 0;
		let failCount = 0;

		for (const id of selectedIds) {
			try {
				await deleteUser(id);
				successCount++;
			} catch {
				failCount++;
			}
		}

		if (successCount > 0) {
			toast.success(t("deleteStaffDialog.success", { count: successCount }));
		}
		if (failCount > 0) {
			toast.error(t(ERROR_KEYS.PARTIAL_STAFF_FAIL, { count: failCount }));
		}

		setSelectedIds([]);
		await fetchStaffList();
		setLoading(false);
		setConfirmOpen(false);
	};

	const filteredStaff = staffList.filter((user) =>
		`${user.firstName} ${user.lastName} ${user.email}`
			.toLowerCase()
			.includes(searchTerm.toLowerCase()),
	);

	const selectableCount = filteredStaff.filter(
		(u) => u.id !== currentUserId,
	).length;
	const allSelected =
		selectableCount > 0 &&
		filteredStaff
			.filter((u) => u.id !== currentUserId)
			.every((u) => selectedIds.includes(u.id));

	if (!open) return null;

	return (
		<>
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
				onClick={() => onOpenChange(false)}
			>
				<div
					className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
					dir={isRtl ? "rtl" : "ltr"}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex items-center justify-between px-5 py-4 border-b">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
								<Trash2 className="w-4 h-4 text-red-600" />
							</div>
							<div>
								<h2 className="text-base font-semibold text-gray-900">
									{t("deleteStaffDialog.title")}
								</h2>
								{selectedIds.length > 0 && (
									<p className="text-xs text-red-500 font-medium">
										{t("deleteStaffDialog.selectedCount", {
											count: selectedIds.length,
										})}
									</p>
								)}
							</div>
						</div>
						<button
							onClick={() => onOpenChange(false)}
							className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					{/* Search + select all */}
					<div className="px-4 pt-3 pb-2 space-y-2">
						<div className="relative">
							<Search
								className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 ${isRtl ? "right-3" : "left-3"}`}
							/>
							<input
								type="text"
								placeholder={t("deleteStaffDialog.searchPlaceholder")}
								className={`w-full border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"}`}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{/* Select all row */}
						{filteredStaff.length > 0 && selectableCount > 0 && (
							<div
								className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
								onClick={toggleAll}
							>
								<Checkbox
									checked={allSelected}
									onCheckedChange={toggleAll}
									onClick={(e) => e.stopPropagation()}
								/>
								<span className="text-sm text-gray-500 font-medium">
									{allSelected
										? t("deleteStaffDialog.deselectAll")
										: t("deleteStaffDialog.selectAll")}
								</span>
								<span className="ms-auto text-xs text-gray-400">
									{selectedIds.length}/{selectableCount}
								</span>
							</div>
						)}
					</div>

					<Separator />

					{/* List */}
					<div className="flex-1 overflow-y-auto p-3 space-y-1.5">
						{fetching ? (
							<div className="flex items-center justify-center py-10">
								<div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-700 rounded-full" />
							</div>
						) : filteredStaff.length === 0 ? (
							<p className="text-sm text-gray-400 text-center py-8">
								{t("deleteStaffDialog.noStaffFound")}
							</p>
						) : (
							filteredStaff.map((user) => {
								const isSelf = user.id === currentUserId;
								const isSelected = selectedIds.includes(user.id);
								const isExpired = user.expiresAt
									? new Date(user.expiresAt) < new Date()
									: false;

								return (
									<div
										key={user.id}
										onClick={() => !isSelf && toggleCheck(user.id)}
										className={`flex items-center gap-3 p-3 border rounded-lg transition-all
                      ${
												isSelf
													? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
													: isSelected
														? "border-red-200 bg-red-50 cursor-pointer"
														: "border-gray-100 hover:bg-gray-50 hover:border-gray-200 cursor-pointer"
											}
                    `}
									>
										<Checkbox
											checked={isSelected}
											disabled={isSelf}
											onCheckedChange={() => !isSelf && toggleCheck(user.id)}
											onClick={(e) => e.stopPropagation()}
										/>

										{/* Avatar */}
										<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
											{user.firstName?.charAt(0)}
											{user.lastName?.charAt(0)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-1.5 flex-wrap">
												<p className="text-sm font-semibold text-gray-800 truncate">
													{user.firstName} {user.lastName}
												</p>
												{user.role === "admin" && (
													<ShieldUser className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
												)}
												{isSelf && (
													<span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
														{t("deleteStaffDialog.you")}
													</span>
												)}
												{!user.isActive && (
													<span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
														{t("staffDetail.disabled")}
													</span>
												)}
												{isExpired && (
													<span className="text-[10px] font-medium bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
														{t("staffDetail.expired")}
													</span>
												)}
											</div>
											<p className="text-xs text-gray-400 truncate">
												{user.email}
											</p>
										</div>

										<span
											className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
												user.role === "admin"
													? "bg-purple-100 text-purple-700"
													: "bg-blue-100 text-blue-700"
											}`}
										>
											{t(`roles.${user.role}`)}
										</span>
									</div>
								);
							})
						)}
					</div>

					{/* Warning when items selected */}
					{selectedIds.length > 0 && (
						<div className="mx-4 mb-2 flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
							<AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
							<p className="text-xs text-red-600">
								{t("deleteStaffDialog.warningMessage", {
									count: selectedIds.length,
								})}
							</p>
						</div>
					)}

					{/* Footer */}
					<div className="px-4 py-3 bg-gray-50 border-t flex gap-2">
						<button
							onClick={() => onOpenChange(false)}
							className="flex-1 h-9 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-100 transition-colors"
						>
							{t("common.cancel")}
						</button>
						<button
							onClick={() => {
								if (selectedIds.length === 0) {
									toast.warning(t("deleteStaffDialog.warnings.noSelection"));
								} else {
									setConfirmOpen(true);
								}
							}}
							disabled={loading || selectedIds.length === 0}
							className="flex-1 h-9 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
						>
							{loading ? (
								<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
							) : (
								<>
									<Trash2 className="w-4 h-4" />
									{selectedIds.length > 0
										? `${t("common.delete")} (${selectedIds.length})`
										: t("common.delete")}
								</>
							)}
						</button>
					</div>
				</div>
			</div>

			<ConfirmDialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={handleDelete}
				title={t("deleteStaffDialog.confirm.title")}
				description={t("deleteStaffDialog.confirm.description", {
					count: selectedIds.length,
				})}
			/>
		</>
	);
};

export default DeleteStaffDialog;
