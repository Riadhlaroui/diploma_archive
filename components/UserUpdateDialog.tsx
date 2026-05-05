// UserUpdateDialog.tsx
"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { UserList, updateUser } from "@/app/src/services/userService";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DatePicker } from "./ui/DatePicker";
import { PERMISSION_GROUPS } from "@/app/src/config/permissionGroups";
import { ROLE_PRESETS, type Permission } from "@/app/src/config/permissions";
import { PhoneInput } from "./ui/PhoneInput";
import { ERROR_KEYS } from "@/lib/constants/errors";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserList | null;
};

type FormState = {
	firstName: string;
	lastName: string;
	phone: string;
	role: "admin" | "staff";
	isActive: boolean;
	expiresAt: string | null;
	permissions: Permission[];
};

export function UserUpdateDialog({ open, onOpenChange, user }: Props) {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	const [form, setForm] = useState<FormState>({
		firstName: "",
		lastName: "",
		phone: "",
		role: "staff",
		isActive: true,
		expiresAt: null,
		permissions: ROLE_PRESETS.staff,
	});

	const set = (field: Partial<FormState>) =>
		setForm((prev) => ({ ...prev, ...field }));

	const handleRoleChange = (value: "admin" | "staff") => {
		set({ role: value, permissions: ROLE_PRESETS[value] });
	};

	useEffect(() => {
		if (user) {
			setForm({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				phone: user.phone || "",
				role: (user.role as "admin" | "staff") || "staff",
				isActive: user.isActive ?? true,
				expiresAt: user.expiresAt || null,
				permissions: user.permissions ?? ROLE_PRESETS[user.role] ?? [],
			});
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		try {
			await updateUser(user.id, {
				firstName: form.firstName,
				lastName: form.lastName,
				phone: form.phone,
				role: form.role,
				isActive: form.isActive,
				expiresAt: form.expiresAt,
				permissions: form.permissions,
			});
			toast.success(t("editUserDialog.successMessage"));
			onOpenChange(false);
		} catch (error: any) {
			console.error("Error updating user:", error);
			toast.error(t(ERROR_KEYS.FAILED_TO_UPDATE_STAFF));
		}
	};

	const inputClass =
		"peer w-full h-10 bg-white border border-gray-300 rounded-lg px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all";
	const labelClass = "block text-xs font-medium text-gray-500 mb-1.5";
	const fieldClass = "flex flex-col";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
				dir={isRtl ? "rtl" : "ltr"}
			>
				{/* Header */}
				<SheetHeader className="px-5 py-4 border-b">
					<SheetTitle className="text-base font-semibold">
						{t("editUserDialog.title")}
					</SheetTitle>
					<SheetDescription className="text-xs text-gray-400">
						{t("editUserDialog.description")}
					</SheetDescription>
				</SheetHeader>

				{/* Scrollable body */}
				<div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
					<form
						id="edit-user-form"
						onSubmit={handleSubmit}
						className="space-y-5"
					>
						{/* Name */}
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
								{t("staffDetail.info") || "Contact"}
							</p>
							<div className="grid grid-cols-2 gap-3">
								<div className={fieldClass}>
									<label className={labelClass}>
										{t("addStaffDialog.firstName")}{" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={form.firstName}
										onChange={(e) => set({ firstName: e.target.value })}
										className={inputClass}
									/>
								</div>
								<div className={fieldClass}>
									<label className={labelClass}>
										{t("addStaffDialog.lastName")}{" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={form.lastName}
										onChange={(e) => set({ lastName: e.target.value })}
										className={inputClass}
									/>
								</div>
							</div>
						</div>

						{/* Phone */}
						<div className={fieldClass}>
							<label className={labelClass}>
								{t("addStaffDialog.phoneNumber")}
							</label>
							<PhoneInput
								value={form.phone}
								onChange={(val) => set({ phone: val })}
							/>
						</div>

						<Separator />

						{/* Role */}
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
								{t("staffDetail.role&access") || "Role & Access"}
							</p>
							<div className={fieldClass}>
								<label className={labelClass}>
									{t("addStaffDialog.roleLabel")}
								</label>
								<Select value={form.role} onValueChange={handleRoleChange}>
									<SelectTrigger className="h-10 text-sm border-gray-300 rounded-lg">
										<SelectValue
											placeholder={t("addStaffDialog.selectRolePlaceholder")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>{t("addStaffDialog.roleLabel")}</SelectLabel>
											<SelectItem value="staff">
												{t("addStaffDialog.staffRole")}
											</SelectItem>
											<SelectItem value="admin">
												{t("addStaffDialog.adminRole")}
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Active toggle */}
						<div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
							<div>
								<p className="text-sm font-medium text-gray-800">
									{t("addStaffDialog.activeAccount")}
								</p>
								<p className="text-xs text-gray-400">
									{t("addStaffDialog.activeAccountDescription")}
								</p>
							</div>
							<div dir="ltr">
								<Switch
									checked={form.isActive}
									onCheckedChange={(v) => set({ isActive: v })}
								/>
							</div>
						</div>

						{/* Expiry date */}
						<div className={fieldClass}>
							<label className={labelClass}>
								{t("addStaffDialog.expiryDate")}
							</label>
							<DatePicker
								value={form.expiresAt}
								onChange={(val) => set({ expiresAt: val })}
								min={new Date().toISOString().split("T")[0]}
								placeholder={t("addStaffDialog.noExpiry")}
								clearable
							/>
							<p className="text-xs text-gray-400 mt-1">
								{t("addStaffDialog.expiryDescription")}
							</p>
						</div>

						<Separator />

						{/* Permissions */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
									{t("addStaffDialog.permissions")}
								</p>
								<button
									type="button"
									onClick={() => set({ permissions: ROLE_PRESETS[form.role] })}
									className="text-xs text-gray-400 underline hover:text-gray-700 transition-colors"
								>
									{t("addStaffDialog.resetPermissions")}
								</button>
							</div>

							{form.role === "admin" ? (
								<div className="p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-700 font-medium">
									Admin has full access to everything
								</div>
							) : (
								<div className="space-y-2">
									{PERMISSION_GROUPS.map((group) => {
										const allChecked = group.permissions.every((p) =>
											form.permissions.includes(p),
										);

										return (
											<div
												key={group.labelKey}
												className="border rounded-lg overflow-hidden"
											>
												{/* Group header */}
												<div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
													<div className="flex items-center gap-2">
														<span className="text-xs font-semibold text-gray-600">
															{t(group.labelKey)}
														</span>
													</div>
													<button
														type="button"
														onClick={() => {
															if (allChecked) {
																set({
																	permissions: form.permissions.filter(
																		(p) => !group.permissions.includes(p),
																	),
																});
															} else {
																const merged = Array.from(
																	new Set([
																		...form.permissions,
																		...group.permissions,
																	]),
																);
																set({ permissions: merged as Permission[] });
															}
														}}
														className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
													>
														{t(
															allChecked
																? "addStaffDialog.deselectAll"
																: "addStaffDialog.selectAll",
														)}
													</button>
												</div>

												{/* Checkboxes */}
												<div className="grid grid-cols-2 divide-x divide-gray-100">
													{group.permissions.map((perm, i) => (
														<label
															key={perm}
															className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors
                                ${i < group.permissions.length - 2 ? "border-b border-gray-100" : ""}
                              `}
														>
															<input
																type="checkbox"
																checked={form.permissions.includes(perm)}
																className="accent-gray-900 w-3.5 h-3.5 cursor-pointer"
																onChange={(e) =>
																	set({
																		permissions: e.target.checked
																			? [...form.permissions, perm]
																			: form.permissions.filter(
																					(p) => p !== perm,
																				),
																	})
																}
															/>
															<span className="text-sm text-gray-700 capitalize">
																{perm.replace(/^[^_]+_/, "")}
															</span>
														</label>
													))}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</form>
				</div>

				{/* Footer */}
				<div className="px-5 py-4 border-t bg-gray-50 flex gap-2">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="flex-1 h-9 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-100 transition-colors"
					>
						{t("addStaffDialog.cancelButton")}
					</button>
					<button
						type="submit"
						form="edit-user-form"
						className="flex-1 h-9 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
					>
						{t("addStaffDialog.submitButton")}
					</button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
