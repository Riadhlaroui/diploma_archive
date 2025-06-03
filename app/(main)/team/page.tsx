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
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Check,
	Copy,
	Loader2,
	RefreshCcw,
	Search,
	Trash2,
	UserRoundPen,
	UserRoundPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
	deleteUser,
	getUsersList,
	UserList,
} from "@/app/src/services/userService";
import AddStaffDialog from "@/components/AddStaffDialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { UserUpdateDialog } from "@/components/UserUpdateDialog";

const StaffList = () => {
	const [logs, setLogs] = useState<UserList[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [totalPages, setTotalPages] = useState(1);
	const [page, setPage] = useState(1);
	const [copiedId, setCopiedId] = useState("");

	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);

	const [inputValue, setInputValue] = useState(""); // What user types
	const [searchTerm, setSearchTerm] = useState(""); // Triggers search

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	const [selectedUser, setSelectedUser] = useState<UserList | null>(null);

	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";

	const fetchData = async () => {
		try {
			setError(null);
			setLoading(true);
			const result = await getUsersList(page || 1, 13, searchTerm);
			setLogs(result.items);
			setTotalPages(result.totalPages);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.error("Failed to fetch staff list:", err);
			setError("Failed to load data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [page, searchTerm]);

	const handleRefresh = () => fetchData();

	const handleEdit = (user: UserList) => {
		setSelectedUser(user);
		setOpenEditDialog(true);
	};

	const handleDelete = (id: string) => {
		setSelectedUserId(id);
		setConfirmOpen(true);
		setSelectedUser(logs.find((user) => user.id === id) || null);
	};

	const confirmDelete = async () => {
		if (!selectedUserId) return;

		try {
			await deleteUser(selectedUserId);
			toast.success(t("staffList.deleteSuccess"));
			fetchData();
		} catch (error) {
			console.error("Failed to delete user:", error);
			toast.error(t("staffList.deleteError"));
		} finally {
			setConfirmOpen(false);
			setSelectedUserId(null);
		}
	};

	return (
		<div className="flex flex-col h-full mt-10 p-6 rounded-md shadow-lg">
			<div className="flex gap-2 mb-4 items-center">
				<h3
					className="text-2xl font-semibold cursor-pointer hover:underline"
					onClick={() => window.location.reload()}
				>
					{t("staffList.title")}
				</h3>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					onClick={handleRefresh}
					disabled={loading}
				>
					{loading ? (
						<Loader2 className="animate-spin text-black dark:text-white" />
					) : (
						<RefreshCcw className="text-black dark:text-white" />
					)}
				</Button>
				<Button
					className="w-fit bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2 hover:cursor-pointer"
					onClick={() => setOpenAddDialog(true)}
				>
					<UserRoundPlus className=" text-black text-center" />
				</Button>
			</div>

			<div className="flex gap-2 mb-4">
				<div className="relative w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
					<input
						type="text"
						placeholder="Search departments..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						className="pl-9 pr-3 py-1 w-full border rounded dark:bg-zinc-800 dark:text-white transition-colors"
					/>
				</div>
				<button
					onClick={() => {
						setPage(1);
						setSearchTerm(inputValue.trim());
					}}
					className="px-4 py-1 rounded border hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
				>
					Search
				</button>
			</div>

			{error && (
				<div className="text-red-500 text-sm mb-4 text-center">{error}</div>
			)}

			<Table className="text-sm rounded-xl shadow-lg bg-white dark:bg-zinc-900">
				<TableHeader>
					<TableRow>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.id")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.firstName")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.lastName")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.email")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.role")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.phone")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.created")}
						</TableHead>
						<TableHead className={isRtl ? "text-right" : "text-left"}>
							{t("staffList.actions")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={8} className="text-center py-6">
								<Loader2 className="mx-auto animate-spin text-gray-500" />
								<span className="text-sm text-gray-500 mt-2 block">
									{t("staffList.loading")}
								</span>
							</TableCell>
						</TableRow>
					) : logs.length > 0 ? (
						logs.map((user) => (
							<TableRow
								key={user.id}
								className="hover:bg-gray-100 dark:hover:bg-zinc-800 hover:cursor-pointer"
							>
								<TableCell>
									<span className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{user.id}
										{copiedId === user.id ? (
											<Check size={14} className="text-green-600" />
										) : (
											<button
												onClick={() => {
													navigator.clipboard.writeText(user.id);
													setCopiedId(user.id);
													setTimeout(() => setCopiedId(""), 1500);
												}}
												title={"copy"}
												className="hover:text-blue-500"
											>
												<Copy size={14} className=" hover:cursor-pointer" />
											</button>
										)}
									</span>
								</TableCell>
								<TableCell>{user.firstName}</TableCell>
								<TableCell>{user.lastName}</TableCell>
								<TableCell>
									<span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-medium">
										{user.email}
									</span>
								</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell>{user.phone}</TableCell>
								<TableCell>
									{new Date(user.createdAt).toLocaleString()}
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleEdit(user)}
											className=" hover:cursor-pointer"
										>
											<UserRoundPen />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete(user.id)}
											className=" hover:cursor-pointer bg-[#f44336] text-white"
										>
											<Trash2 />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={8} className="text-center py-6 text-gray-500">
								{t("staffList.title")}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={8} className="text-center py-3">
							<div className="flex items-center justify-center gap-4">
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.max(p - 1, 1))}
									disabled={page === 1 || loading}
									className="hover:cursor-pointer"
								>
									{t("pagination.previous")}
								</Button>
								<span className="text-sm">
									{t("pagination.pageOf", { page, totalPages })}
								</span>
								<Button
									variant="outline"
									onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
									disabled={page >= totalPages || loading}
									className="hover:cursor-pointer"
								>
									{t("pagination.next")}
								</Button>
							</div>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>

			<AddStaffDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />

			<UserUpdateDialog
				open={openEditDialog}
				onOpenChange={setOpenEditDialog}
				user={selectedUser}
			/>

			<ConfirmDialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={confirmDelete}
				title={t("staffList.confirmDelete")}
				description={
					selectedUser
						? t("staffList.confirmDeleteDesc", {
								email: selectedUser.email,
								role: selectedUser.role,
								firstName: selectedUser.firstName,
								lastName: selectedUser.lastName,
						  })
						: ""
				}
			/>
		</div>
	);
};

export default StaffList;
