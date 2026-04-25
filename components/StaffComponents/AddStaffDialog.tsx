"use client";

import React, { useState, useMemo } from "react";
import { Eye, EyeOff, X, Check, AlertCircle } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { createUser } from "../../app/src/services/userService";
import { Separator } from "../ui/separator";
import { ROLE_PRESETS, type Permission } from "@/app/src/config/permissions";
import { PERMISSION_GROUPS } from "../../app/src/config/permissionGroups";
import { DatePicker } from "../ui/DatePicker";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type FormState = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
	role: "admin" | "staff";
	isActive: boolean;
	expiresAt: string | null;
	permissions: Permission[];
};

const INITIAL_FORM: FormState = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	password: "",
	confirmPassword: "",
	role: "staff",
	isActive: true,
	expiresAt: null,
	permissions: ROLE_PRESETS.staff,
};

const AddStaffDialog = ({ open, onOpenChange }: Props) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	const [form, setForm] = useState<FormState>(INITIAL_FORM);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const set = (field: Partial<FormState>) =>
		setForm((prev) => ({ ...prev, ...field }));

	// When role changes, reset permissions to that role's defaults
	const handleRoleChange = (value: "admin" | "staff") => {
		set({ role: value, permissions: ROLE_PRESETS[value] });
	};

	const passwordRequirements = useMemo(
		() => [
			{
				id: "len",
				label: t("addStaffDialog.req.length", "At least 8 characters"),
				valid: form.password.length >= 8,
			},
			{
				id: "upper",
				label: t("addStaffDialog.req.upper", "One uppercase letter"),
				valid: /[A-Z]/.test(form.password),
			},
			{
				id: "lower",
				label: t("addStaffDialog.req.lower", "One lowercase letter"),
				valid: /[a-z]/.test(form.password),
			},
			{
				id: "num",
				label: t("addStaffDialog.req.number", "One number"),
				valid: /[0-9]/.test(form.password),
			},
			{
				id: "special",
				label: t("addStaffDialog.req.special", "One special character"),
				valid: /[^A-Za-z0-9]/.test(form.password),
			},
		],
		[form.password, t],
	);

	const isPasswordStrong = passwordRequirements.every((r) => r.valid);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (
			!form.firstName ||
			!form.lastName ||
			!form.phone ||
			!form.email ||
			!form.password
		) {
			toast.error(
				t("addStaffDialog.errors.missingTitle", "Please fill in all fields"),
			);
			return;
		}
		if (form.password !== form.confirmPassword) {
			toast.error(
				t("addStaffDialog.errors.mismatchTitle", "Passwords do not match"),
			);
			return;
		}
		if (!isPasswordStrong) {
			toast.error(
				t(
					"addStaffDialog.errors.weakTitle",
					"Password does not meet requirements",
				),
			);
			return;
		}

		try {
			await createUser({
				email: form.email,
				password: form.password,
				firstName: form.firstName,
				lastName: form.lastName,
				phone: form.phone,
				role: form.role,
				isActive: form.isActive,
				expiresAt: form.expiresAt,
				permissions: form.permissions,
			});
			toast.success(t("addStaffDialog.userCreatedSuccess"));
			setForm(INITIAL_FORM);
			onOpenChange(false);
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error(t("addStaffDialog.errors.userCreatedError"));
		}
	};

	if (!open) return null;

	const inputClass =
		"flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:focus:ring-white transition-all duration-200";
	const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";
	const fieldClass = "flex flex-col gap-1.5";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div
				className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
				dir={isRtl ? "rtl" : "ltr"}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h2 className="text-lg font-semibold text-gray-900">
						{t("addStaffDialog.title")}
					</h2>
					<button
						onClick={() => onOpenChange(false)}
						className="text-gray-400 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Scrollable body */}
				<div className="px-6 py-6 overflow-y-auto">
					<form
						id="add-staff-form"
						onSubmit={handleSubmit}
						className="space-y-5"
					>
						{/* Name row */}
						<div className="flex flex-col sm:flex-row gap-4">
							<div className={`w-full ${fieldClass}`}>
								<label className={labelClass}>
									{t("addStaffDialog.firstName")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={form.firstName}
									className={inputClass}
									onChange={(e) => set({ firstName: e.target.value })}
								/>
							</div>
							<div className={`w-full ${fieldClass}`}>
								<label className={labelClass}>
									{t("addStaffDialog.lastName")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={form.lastName}
									className={inputClass}
									onChange={(e) => set({ lastName: e.target.value })}
								/>
							</div>
						</div>

						{/* Email */}
						<div className={fieldClass}>
							<label className={labelClass}>
								{t("addStaffDialog.email")}{" "}
								<span className="text-red-500">*</span>
							</label>
							<input
								type="email"
								value={form.email}
								className={inputClass}
								onChange={(e) => set({ email: e.target.value })}
							/>
						</div>

						{/* Phone */}
						<div className={fieldClass}>
							<label className={labelClass}>
								{t("addStaffDialog.phoneNumber")}{" "}
								<span className="text-red-500">*</span>
							</label>
							<input
								type="tel"
								value={form.phone}
								className={inputClass}
								onChange={(e) => set({ phone: e.target.value })}
							/>
						</div>

						<Separator />

						{/* Password */}
						<div className={fieldClass}>
							<label className={labelClass}>
								{t("addStaffDialog.password")}{" "}
								<span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<input
									type={isPasswordVisible ? "text" : "password"}
									value={form.password}
									className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
									onChange={(e) => set({ password: e.target.value })}
								/>
								<button
									type="button"
									onClick={() => setIsPasswordVisible((v) => !v)}
									className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? "left-3" : "right-3"}`}
								>
									{isPasswordVisible ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							{form.password.length > 0 && (
								<div className="bg-gray-50 p-3 rounded-md mt-1 border border-gray-100">
									<p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
										{t(
											"addStaffDialog.passwordRequirements",
											"Password Requirements",
										)}
									</p>
									<ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{passwordRequirements.map((req) => (
											<li
												key={req.id}
												className="flex items-center gap-2 text-xs"
											>
												{req.valid ? (
													<div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
														<Check className="w-3 h-3 text-green-600" />
													</div>
												) : (
													<div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
														<div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
													</div>
												)}
												<span
													className={
														req.valid
															? "text-green-700 font-medium"
															: "text-gray-500"
													}
												>
													{req.label}
												</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* Confirm password */}
						<div className={fieldClass}>
							<label className={labelClass}>
								{t("addStaffDialog.confirmPassword")}{" "}
								<span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<input
									type={isConfirmPasswordVisible ? "text" : "password"}
									value={form.confirmPassword}
									className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
									onChange={(e) => set({ confirmPassword: e.target.value })}
								/>
								<button
									type="button"
									onClick={() => setIsConfirmPasswordVisible((v) => !v)}
									className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? "left-3" : "right-3"}`}
								>
									{isConfirmPasswordVisible ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							{form.confirmPassword &&
								form.password !== form.confirmPassword && (
									<div className="flex items-center gap-2 text-red-500 text-xs mt-1">
										<AlertCircle className="w-3 h-3" />
										{t(
											"addStaffDialog.errors.mismatchShort",
											"Passwords do not match",
										)}
									</div>
								)}
						</div>

						<Separator />

						{/* Role */}
						<div className={fieldClass}>
							<label className={labelClass}>
								{t("addStaffDialog.roleLabel")}
							</label>
							<Select value={form.role} onValueChange={handleRoleChange}>
								<SelectTrigger className="w-full">
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

						{/* Active toggle */}
						<div className="flex items-center justify-between p-3 border rounded-lg">
							<div>
								<p className="text-sm font-medium">
									{t("addStaffDialog.activeAccount")}
								</p>
								<p className="text-xs text-gray-500">
									{t("addStaffDialog.activeAccountDescription")}
								</p>
							</div>
							<div dir="ltr">
								<Switch
									checked={form.isActive}
									onCheckedChange={(v: boolean) => set({ isActive: v })}
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
							<p className="text-xs text-gray-400">
								{t("addStaffDialog.expiryDescription")}
							</p>
						</div>

						{/* Permissions */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<label className={labelClass}>
									{t("addStaffDialog.permissions")}
								</label>
								<button
									type="button"
									onClick={() => set({ permissions: ROLE_PRESETS[form.role] })}
									className="text-xs text-gray-500 underline hover:text-gray-700"
								>
									{t("addStaffDialog.resetPermissions")}
								</button>
							</div>

							<div className="space-y-3">
								{PERMISSION_GROUPS.map((group) => {
									const groupPerms = group.permissions;
									const allChecked = groupPerms.every((p) =>
										form.permissions.includes(p),
									);
									const someChecked = groupPerms.some((p) =>
										form.permissions.includes(p),
									);

									return (
										<div
											key={group.label}
											className="border rounded-lg overflow-hidden"
										>
											{/* Group header */}
											<div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
												<div className="flex items-center gap-2">
													<span className="text-sm font-semibold text-gray-700">
														{group.label}
													</span>
												</div>
												{/* Select all toggle for this group */}
												<button
													type="button"
													onClick={() => {
														if (allChecked) {
															set({
																permissions: form.permissions.filter(
																	(p) => !groupPerms.includes(p),
																),
															});
														} else {
															const merged = Array.from(
																new Set([...form.permissions, ...groupPerms]),
															);
															set({ permissions: merged as Permission[] });
														}
													}}
													className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
												>
													{allChecked ? "Deselect all" : "Select all"}
												</button>
											</div>

											{/* Permission checkboxes */}
											<div className="grid grid-cols-2 gap-0 divide-x divide-gray-100">
												{groupPerms.map((perm, i) => (
													<label
														key={perm}
														className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors
                  ${i < groupPerms.length - 2 ? "border-b border-gray-100" : ""}
                  ${someChecked && !allChecked && form.permissions.includes(perm) ? "bg-blue-50/40" : ""}
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
															{perm.replace(/^[^_]+_/, "")}{" "}
															{/* show only "view", "create" etc */}
														</span>
													</label>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</form>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
					<button
						type="button"
						onClick={() => {
							setForm(INITIAL_FORM);
							onOpenChange(false);
						}}
						className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
					>
						{t("addStaffDialog.cancelButton")}
					</button>
					<button
						type="submit"
						form="add-staff-form"
						disabled={!isPasswordStrong || !form.email || !form.firstName}
						className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						{t("addStaffDialog.submitButton")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddStaffDialog;
