"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUser, UserList } from "@/app/src/services/userService"; // ← UserList, not User
import { Search, ShieldUser, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import ConfirmDialog from "../ConfirmDialog";
import { useTranslation } from "react-i18next";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const DeleteStaffDialog = ({ open, onOpenChange }: Props) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	const [staffList, setStaffList] = useState<UserList[]>([]); // ← UserList[]
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		if (open) fetchStaffList();
	}, [open]);

	const fetchStaffList = async () => {
		try {
			const users = await getUsers();
			setStaffList(users);
		} catch (err) {
			console.error(err);
			toast.error(t("deleteStaffDialog.errors.fetchFailed"));
		}
	};

	const toggleCheck = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const handleDelete = async () => {
		if (selectedIds.length === 0) return;
		setLoading(true);
		try {
			for (const id of selectedIds) {
				await deleteUser(id);
			}
			toast.success(
				t("deleteStaffDialog.success", { count: selectedIds.length }),
			);
			setSelectedIds([]);
			await fetchStaffList();
		} catch (error) {
			console.error("Delete error:", error);
			toast.error(t("deleteStaffDialog.errors.deleteFailed"));
		} finally {
			setLoading(false);
			setConfirmOpen(false);
		}
	};

	const filteredStaff = staffList.filter((user) =>
		`${user.firstName} ${user.lastName} ${user.email}`
			.toLowerCase()
			.includes(searchTerm.toLowerCase()),
	);

	if (!open) return null;

	return (
		<>
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
				onClick={() => onOpenChange(false)}
			>
				<div
					className="shadow-2xl bg-white w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-lg relative"
					dir={isRtl ? "rtl" : "ltr"}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b">
						<h2 className="text-lg font-semibold text-gray-900">
							{t("deleteStaffDialog.title")}
						</h2>
						<button
							onClick={() => onOpenChange(false)}
							className="text-gray-400 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Search */}
					<div className="mt-4 relative p-2">
						<Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							type="text"
							placeholder={t("deleteStaffDialog.searchPlaceholder")}
							className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-gray-300"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* List */}
					<div className="mt-2 flex-1 overflow-y-auto space-y-2 p-2">
						{filteredStaff.length === 0 ? (
							<p className="text-sm text-gray-500 text-center py-6">
								{t("deleteStaffDialog.noStaffFound")}
							</p>
						) : (
							filteredStaff.map((user) => (
								<div
									key={user.id}
									onClick={() => toggleCheck(user.id)}
									className={`flex items-center gap-4 p-3 border shadow-sm rounded-md cursor-pointer transition-colors ${
										selectedIds.includes(user.id)
											? "border-red-200 bg-red-50"
											: "hover:bg-gray-50"
									}`}
								>
									<Checkbox
										checked={selectedIds.includes(user.id)}
										onCheckedChange={() => toggleCheck(user.id)}
										onClick={(e) => e.stopPropagation()}
									/>
									<div className="flex-1">
										<div className="flex items-center gap-1.5">
											<p className="text-[15px] font-semibold text-gray-800">
												{user.firstName} {user.lastName}
											</p>
											{user.role === "admin" && (
												<ShieldUser className="w-4 h-4 text-green-500" />
											)}
											{/* Show disabled badge if account is inactive */}
											{!user.isActive && (
												<span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
													Disabled
												</span>
											)}
										</div>
										<span className="text-gray-400 text-sm">
											{t("deleteStaffDialog.roleLabel")}:{" "}
											{t(`roles.${user.role}`)}
										</span>
										{/* Show expiry if set */}
										{user.expiresAt && (
											<p className="text-xs text-amber-500 mt-0.5">
												Expires: {new Date(user.expiresAt).toLocaleDateString()}
											</p>
										)}
									</div>
								</div>
							))
						)}
					</div>

					<Separator className="mt-2" />

					{/* Footer */}
					<div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
						<button
							onClick={() => onOpenChange(false)}
							className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
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
							className="bg-red-600 text-white px-4 py-2.5 rounded-xl flex-1 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{loading
								? t("deleteStaffDialog.deleting")
								: `${t("common.delete")} (${selectedIds.length})`}
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
