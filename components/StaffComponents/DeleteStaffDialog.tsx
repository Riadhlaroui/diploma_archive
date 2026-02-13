"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUsers } from "@/app/src/services/userService";
import { User } from "../../app/src/core/domain/entities/User";
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
	const [staffList, setStaffList] = useState<User[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		if (open) {
			fetchStaffList();
		}
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
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleDelete = async () => {
		if (selectedIds.length === 0) return;

		setLoading(true);

		try {
			await deleteUsers(selectedIds);
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
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
				onClick={() => onOpenChange(false)}
			>
				<div
					className="shadow-2xl bg-white w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-lg  relative "
					dir={isRtl ? "rtl" : "ltr"}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							{t("deleteStaffDialog.title")}
						</h2>
						<button
							onClick={() => onOpenChange(false)}
							className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<div className="mt-4 relative p-2">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							type="text"
							placeholder={t("deleteStaffDialog.searchPlaceholder")}
							className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:outline-none"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="mt-4 flex-1 overflow-y-auto space-y-2 p-2">
						{filteredStaff.length === 0 ? (
							<p className="text-sm text-gray-500">
								{t("deleteStaffDialog.noStaffFound")}
							</p>
						) : (
							filteredStaff.map((user) => (
								<div
									key={user.id}
									className="flex items-center gap-4 p-3 border shadow-sm rounded-md"
								>
									<Checkbox
										className="hover:cursor-pointer"
										checked={selectedIds.includes(user.id)}
										onCheckedChange={() => toggleCheck(user.id)}
									/>
									<div className="flex-1">
										<div className="flex items-center gap-1.5">
											<p className="text-[18px] font-semibold text-gray-800">
												{user.firstName} {user.lastName}
											</p>
											{user.role === "admin" && (
												<ShieldUser className="w-5 h-5 text-[#55e734]" />
											)}
										</div>
										<span className="text-gray-400 text-sm">
											{t("deleteStaffDialog.roleLabel")}:{" "}
											{t(`roles.${user.role}`)}
										</span>
									</div>
								</div>
							))
						)}
					</div>

					<Separator className="mt-2" />

					<div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 flex  gap-3">
						<button
							onClick={() => onOpenChange(false)}
							className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50/40 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
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
							className="bg-red-600 text-white px-4 py-2.5 rounded-xl flex-1 border-zinc-200 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
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
