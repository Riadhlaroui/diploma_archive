"use client";

import {
	X,
	Mail,
	Phone,
	Shield,
	ShieldOff,
	Calendar,
	Clock,
	CheckCircle2,
	XCircle,
	User2,
} from "lucide-react";
import { UserList } from "@/app/src/services/userService";
import { PERMISSION_GROUPS } from "../../app/src/config/permissionGroups";
import { useTranslation } from "react-i18next";

type Props = {
	user: UserList | null;
	open: boolean;
	onClose: () => void;
	onEdit: (user: UserList) => void;
	onDelete: (id: string) => void;
};

export function StaffDetailDrawer({
	user,
	open,
	onClose,
	onEdit,
	onDelete,
}: Props) {
	const { t } = useTranslation();

	if (!user) return null;

	const isExpired = user.expiresAt
		? new Date(user.expiresAt) < new Date()
		: false;
	const isActive = user.isActive && !isExpired;

	const initials =
		`${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
					open ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
				onClick={onClose}
			/>

			{/* Drawer */}
			<div
				className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
					open ? "translate-x-0" : "translate-x-full"
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b">
					<h2 className="text-base font-semibold text-gray-900">
						Staff Details
					</h2>
					<button
						onClick={onClose}
						className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Scrollable content */}
				<div className="flex-1 overflow-y-auto">
					{/* Profile section */}
					<div className="px-5 py-6 border-b">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
								<span className="text-lg font-semibold text-gray-700">
									{initials || <User2 className="w-6 h-6" />}
								</span>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									{user.firstName} {user.lastName}
								</h3>
								<div className="flex items-center gap-2 mt-1">
									<span
										className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
											user.role === "admin"
												? "bg-purple-100 text-purple-700"
												: "bg-blue-100 text-blue-700"
										}`}
									>
										<Shield className="w-3 h-3" />
										{user.role}
									</span>
									<span
										className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
											isActive
												? "bg-green-100 text-green-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{isActive ? (
											<>
												<CheckCircle2 className="w-3 h-3" /> Active
											</>
										) : (
											<>
												<XCircle className="w-3 h-3" />{" "}
												{isExpired ? "Expired" : "Disabled"}
											</>
										)}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Info section */}
					<div className="px-5 py-4 border-b space-y-3">
						<h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
							Contact
						</h4>

						<div className="flex items-center gap-3 text-sm">
							<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
								<Mail className="w-4 h-4 text-gray-500" />
							</div>
							<div>
								<p className="text-xs text-gray-400">Email</p>
								<p className="text-gray-800 font-medium">{user.email}</p>
							</div>
						</div>

						<div className="flex items-center gap-3 text-sm">
							<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
								<Phone className="w-4 h-4 text-gray-500" />
							</div>
							<div>
								<p className="text-xs text-gray-400">Phone</p>
								<p className="text-gray-800 font-medium">{user.phone || "—"}</p>
							</div>
						</div>
					</div>

					{/* Account section */}
					<div className="px-5 py-4 border-b space-y-3">
						<h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
							Account
						</h4>

						<div className="flex items-center gap-3 text-sm">
							<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
								<Clock className="w-4 h-4 text-gray-500" />
							</div>
							<div>
								<p className="text-xs text-gray-400">Created</p>
								<p className="text-gray-800 font-medium">
									{new Date(user.createdAt).toLocaleDateString("en-GB", {
										day: "2-digit",
										month: "short",
										year: "numeric",
									})}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 text-sm">
							<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
								<Calendar className="w-4 h-4 text-gray-500" />
							</div>
							<div>
								<p className="text-xs text-gray-400">Expires</p>
								<p
									className={`font-medium ${isExpired ? "text-red-600" : "text-gray-800"}`}
								>
									{user.expiresAt
										? new Date(user.expiresAt).toLocaleDateString("en-GB", {
												day: "2-digit",
												month: "short",
												year: "numeric",
											})
										: "Never"}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 text-sm">
							<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
								{user.isActive ? (
									<CheckCircle2 className="w-4 h-4 text-green-500" />
								) : (
									<ShieldOff className="w-4 h-4 text-red-500" />
								)}
							</div>
							<div>
								<p className="text-xs text-gray-400">Status</p>
								<p
									className={`font-medium ${user.isActive ? "text-green-700" : "text-red-600"}`}
								>
									{user.isActive ? "Active" : "Disabled"}
								</p>
							</div>
						</div>
					</div>

					{/* Permissions section */}
					<div className="px-5 py-4 space-y-3">
						<h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
							Permissions
						</h4>

						{user.role === "admin" ? (
							<div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg">
								<Shield className="w-4 h-4 text-purple-600" />
								<p className="text-sm text-purple-700 font-medium">
									Admin — full access to everything
								</p>
							</div>
						) : (
							<div className="space-y-2">
								{PERMISSION_GROUPS.map((group) => {
									const granted = group.permissions.filter((p) =>
										user.permissions?.includes(p as any),
									);
									if (granted.length === 0) return null;

									return (
										<div
											key={group.label}
											className="border rounded-lg overflow-hidden"
										>
											<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
												<span className="text-xs font-semibold text-gray-600">
													{group.label}
												</span>
												<span className="ml-auto text-xs text-gray-400">
													{granted.length}/{group.permissions.length}
												</span>
											</div>
											<div className="flex flex-wrap gap-1.5 p-2.5">
												{group.permissions.map((perm) => {
													const has = user.permissions?.includes(perm as any);
													const label = perm.replace(/^[^_]+_/, "");
													return (
														<span
															key={perm}
															className={`text-xs px-2 py-0.5 rounded-full font-medium ${
																has
																	? "bg-green-100 text-green-700"
																	: "bg-gray-100 text-gray-400 line-through"
															}`}
														>
															{label}
														</span>
													);
												})}
											</div>
										</div>
									);
								})}

								{(!user.permissions || user.permissions.length === 0) && (
									<p className="text-sm text-gray-400 text-center py-4">
										No permissions assigned
									</p>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Footer actions */}
				<div className="px-5 py-4 border-t bg-gray-50 flex gap-2">
					<button
						onClick={() => {
							onEdit(user);
							onClose();
						}}
						className="flex-1 h-9 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
					>
						Edit
					</button>
					<button
						onClick={() => {
							onDelete(user.id);
							onClose();
						}}
						className="flex-1 h-9 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
					>
						Delete
					</button>
				</div>
			</div>
		</>
	);
}
