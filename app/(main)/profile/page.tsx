"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
	User2,
	Mail,
	Phone,
	Lock,
	Eye,
	EyeOff,
	Check,
	AlertCircle,
	Shield,
	Calendar,
	CheckCircle2,
	XCircle,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/PhoneInput";

import { PERMISSION_GROUPS } from "@/app/src/config/permissionGroups";
import { PERMISSIONS } from "@/app/src/config/permissions";

type Section = "info" | "email" | "password" | "permissions";

export default function ProfilePage() {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";
	const router = useRouter();

	const model = pb.authStore.model;

	// ── Info form ──────────────────────────────────────────────
	const [info, setInfo] = useState({
		firstName: model?.firstName || "",
		lastName: model?.lastName || "",
		phone: model?.phone || "",
	});
	const [savingInfo, setSavingInfo] = useState(false);

	// ── Email form ─────────────────────────────────────────────
	const [emailForm, setEmailForm] = useState({
		newEmail: "",
		currentPassword: "",
	});
	const [showEmailPassword, setShowEmailPassword] = useState(false);
	const [savingEmail, setSavingEmail] = useState(false);

	// ── Password form ──────────────────────────────────────────
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	const [activeSection, setActiveSection] = useState<Section>("info");

	useEffect(() => {
		if (!pb.authStore.isValid) router.replace("/sign-in");
	}, [router]);

	// ── Password requirements ──────────────────────────────────
	const passwordRequirements = useMemo(
		() => [
			{
				id: "len",
				label: t("addStaffDialog.req.length"),
				valid: passwordForm.newPassword.length >= 8,
			},
			{
				id: "upper",
				label: t("addStaffDialog.req.upper"),
				valid: /[A-Z]/.test(passwordForm.newPassword),
			},
			{
				id: "lower",
				label: t("addStaffDialog.req.lower"),
				valid: /[a-z]/.test(passwordForm.newPassword),
			},
			{
				id: "num",
				label: t("addStaffDialog.req.number"),
				valid: /[0-9]/.test(passwordForm.newPassword),
			},
			{
				id: "special",
				label: t("addStaffDialog.req.special"),
				valid: /[^A-Za-z0-9]/.test(passwordForm.newPassword),
			},
		],
		[passwordForm.newPassword, t],
	);

	const isPasswordStrong = passwordRequirements.every((r) => r.valid);

	// ── Handlers ───────────────────────────────────────────────
	const handleInfoSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!info.firstName.trim() || !info.lastName.trim()) {
			toast.error(t("profile.errors.nameRequired"));
			return;
		}
		try {
			setSavingInfo(true);
			await pb.collection("Archive_users").update(model!.id, {
				firstName: info.firstName.trim(),
				lastName: info.lastName.trim(),
				phone: info.phone.trim(),
			});
			// Refresh auth store
			await pb.collection("Archive_users").authRefresh();
			toast.success(t("profile.infoUpdated"));
		} catch {
			toast.error(t("profile.errors.updateFailed"));
		} finally {
			setSavingInfo(false);
		}
	};

	const handleEmailSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!emailForm.newEmail.trim() || !emailForm.currentPassword) {
			toast.error(t("profile.errors.fillAll"));
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailForm.newEmail)) {
			toast.error(t("profile.errors.invalidEmail"));
			return;
		}
		if (emailForm.newEmail === model?.email) {
			toast.error(t("profile.errors.sameEmail"));
			return;
		}
		try {
			setSavingEmail(true);
			await pb.collection("Archive_users").update(model!.id, {
				email: emailForm.newEmail.trim(),
				emailVisibility: true,
			});
			await pb.collection("Archive_users").authRefresh();
			toast.success(t("profile.emailUpdated"));
			setEmailForm({ newEmail: "", currentPassword: "" });
		} catch (err: any) {
			if (err?.response?.data?.email) {
				toast.error(t("profile.errors.emailExists"));
			} else if (err?.response?.status === 400) {
				toast.error(t("profile.errors.wrongPassword"));
			} else {
				toast.error(t("profile.errors.updateFailed"));
			}
		} finally {
			setSavingEmail(false);
		}
	};

	const handlePasswordSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!passwordForm.currentPassword || !passwordForm.newPassword) {
			toast.error(t("profile.errors.fillAll"));
			return;
		}
		if (!isPasswordStrong) {
			toast.error(t("addStaffDialog.errors.weakTitle"));
			return;
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error(t("addStaffDialog.errors.mismatchTitle"));
			return;
		}
		if (passwordForm.currentPassword === passwordForm.newPassword) {
			toast.error(t("profile.errors.samePassword"));
			return;
		}
		try {
			setSavingPassword(true);
			await pb.collection("Archive_users").update(model!.id, {
				oldPassword: passwordForm.currentPassword,
				password: passwordForm.newPassword,
				passwordConfirm: passwordForm.confirmPassword,
			});
			toast.success(t("profile.passwordUpdated"));
			setPasswordForm({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (err: any) {
			if (err?.response?.data?.oldPassword) {
				toast.error(t("profile.errors.wrongPassword"));
			} else {
				toast.error(t("profile.errors.updateFailed"));
			}
		} finally {
			setSavingPassword(false);
		}
	};

	const isExpired = model?.expiresAt
		? new Date(model.expiresAt) < new Date()
		: false;
	const isActive = model?.isActive && !isExpired;

	const initials =
		`${model?.firstName?.charAt(0) || ""}${model?.lastName?.charAt(0) || ""}`.toUpperCase();

	const inputClass =
		"w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all";
	const labelClass = "block text-xs font-medium text-gray-500 mb-1.5";
	const fieldClass = "flex flex-col";

	const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
		{
			key: "info",
			label: t("profile.sections.info"),
			icon: <User2 className="w-4 h-4" />,
		},
		{
			key: "email",
			label: t("profile.sections.email"),
			icon: <Mail className="w-4 h-4" />,
		},
		{
			key: "password",
			label: t("profile.sections.password"),
			icon: <Lock className="w-4 h-4" />,
		},
		{
			key: "permissions",
			label: t("profile.sections.permissions"),
			icon: <Shield className="w-4 h-4" />,
		},
	];

	return (
		<div className="min-h-full p-6" dir={isRtl ? "rtl" : "ltr"}>
			<div className="max-w-3xl mx-auto">
				{/* Back */}
				<button
					onClick={() => router.back()}
					className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					{t("common.back")}
				</button>

				{/* Profile header card */}
				<div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 flex items-center gap-4">
					<div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
						<span className="text-xl font-semibold text-gray-700">
							{initials || <User2 className="w-7 h-7" />}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<h1 className="text-lg font-semibold text-gray-900">
							{model?.firstName} {model?.lastName}
						</h1>
						<p className="text-sm text-gray-400 truncate">{model?.email}</p>
						<div className="flex items-center gap-2 mt-1.5 flex-wrap">
							<span
								className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
									model?.role === "admin"
										? "bg-purple-100 text-purple-700"
										: "bg-blue-100 text-blue-700"
								}`}
							>
								<Shield className="w-3 h-3" />
								{model?.role}
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
										<CheckCircle2 className="w-3 h-3" />
										{t("staffDetail.active")}
									</>
								) : (
									<>
										<XCircle className="w-3 h-3" />
										{isExpired
											? t("staffDetail.expired")
											: t("staffDetail.disabled")}
									</>
								)}
							</span>
							{model?.createdAt && (
								<span className="inline-flex items-center gap-1 text-xs text-gray-400">
									<Calendar className="w-3 h-3" />
									{new Date(model.created).toLocaleDateString(
										isRtl ? "ar-DZ" : "en-GB",
										{ day: "2-digit", month: "short", year: "numeric" },
									)}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-5">
					{/* Sidebar nav */}
					<div className="md:col-span-1">
						<nav className="bg-white border border-gray-200 rounded-xl overflow-hidden">
							{sections.map((s, i) => (
								<button
									key={s.key}
									onClick={() => setActiveSection(s.key)}
									className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left
                    ${i !== 0 ? "border-t border-gray-100" : ""}
                    ${
											activeSection === s.key
												? "bg-gray-900 text-white"
												: "text-gray-600 hover:bg-gray-50"
										}
                  `}
								>
									{s.icon}
									{s.label}
								</button>
							))}
						</nav>
					</div>

					{/* Main panel */}
					<div className="md:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
						{/* ── Personal Info ── */}
						{activeSection === "info" && (
							<form onSubmit={handleInfoSave}>
								<div className="px-5 py-4 border-b">
									<h2 className="text-sm font-semibold text-gray-900">
										{t("profile.sections.info")}
									</h2>
									<p className="text-xs text-gray-400 mt-0.5">
										{t("profile.infoDescription")}
									</p>
								</div>
								<div className="p-5 space-y-4">
									<div className="grid grid-cols-2 gap-3">
										<div className={fieldClass}>
											<label className={labelClass}>
												{t("addStaffDialog.firstName")}{" "}
												<span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												value={info.firstName}
												onChange={(e) =>
													setInfo((p) => ({ ...p, firstName: e.target.value }))
												}
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
												value={info.lastName}
												onChange={(e) =>
													setInfo((p) => ({ ...p, lastName: e.target.value }))
												}
												className={inputClass}
											/>
										</div>
									</div>

									<div className={fieldClass}>
										<label className={labelClass}>
											{t("addStaffDialog.phoneNumber")}
										</label>
										<PhoneInput
											value={info.phone}
											onChange={(val) => setInfo((p) => ({ ...p, phone: val }))}
										/>
									</div>

									{/* Read-only fields */}
									<Separator />
									<div className="grid grid-cols-2 gap-3">
										<div className={fieldClass}>
											<label className={labelClass}>
												{t("staffList.role")}
											</label>
											<div className="h-10 px-3 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 flex items-center capitalize">
												{model?.role}
											</div>
										</div>
										<div className={fieldClass}>
											<label className={labelClass}>
												{t("staffDetail.status")}
											</label>
											<div className="h-10 px-3 border border-gray-100 rounded-lg text-sm bg-gray-50 flex items-center">
												<span
													className={
														isActive ? "text-green-600" : "text-red-500"
													}
												>
													{isActive
														? t("staffDetail.active")
														: t("staffDetail.disabled")}
												</span>
											</div>
										</div>
									</div>

									{model?.expiresAt && (
										<div className={fieldClass}>
											<label className={labelClass}>
												{t("staffDetail.expires")}
											</label>
											<div
												className={`h-10 px-3 border rounded-lg text-sm bg-gray-50 flex items-center ${
													isExpired
														? "border-red-200 text-red-500"
														: "border-gray-100 text-gray-400"
												}`}
											>
												{new Date(model.expiresAt).toLocaleDateString(
													isRtl ? "ar-DZ" : "en-GB",
													{ day: "2-digit", month: "short", year: "numeric" },
												)}
											</div>
										</div>
									)}
								</div>
								<div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
									<button
										type="submit"
										disabled={savingInfo}
										className="h-9 px-5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
									>
										{savingInfo ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Check className="w-4 h-4" />
										)}
										{t("profile.save")}
									</button>
								</div>
							</form>
						)}

						{/* ── Email ── */}
						{activeSection === "email" && (
							<form onSubmit={handleEmailSave}>
								<div className="px-5 py-4 border-b">
									<h2 className="text-sm font-semibold text-gray-900">
										{t("profile.sections.email")}
									</h2>
									<p className="text-xs text-gray-400 mt-0.5">
										{t("profile.emailDescription")}
									</p>
								</div>
								<div className="p-5 space-y-4">
									{/* Current email read-only */}
									<div className={fieldClass}>
										<label className={labelClass}>
											{t("profile.currentEmail")}
										</label>
										<div className="h-10 px-3 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 flex items-center">
											{model?.email}
										</div>
									</div>

									<div className={fieldClass}>
										<label className={labelClass}>
											{t("profile.newEmail")}{" "}
											<span className="text-red-500">*</span>
										</label>
										<input
											type="email"
											value={emailForm.newEmail}
											onChange={(e) =>
												setEmailForm((p) => ({
													...p,
													newEmail: e.target.value,
												}))
											}
											className={inputClass}
											placeholder="new@example.com"
										/>
									</div>

									<div className={fieldClass}>
										<label className={labelClass}>
											{t("profile.currentPasswordConfirm")}{" "}
											<span className="text-red-500">*</span>
										</label>
										<div className="relative">
											<input
												type={showEmailPassword ? "text" : "password"}
												value={emailForm.currentPassword}
												onChange={(e) =>
													setEmailForm((p) => ({
														...p,
														currentPassword: e.target.value,
													}))
												}
												className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
											/>
											<button
												type="button"
												onClick={() => setShowEmailPassword((v) => !v)}
												className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? "left-3" : "right-3"}`}
											>
												{showEmailPassword ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</button>
										</div>
										<p className="text-xs text-gray-400 mt-1">
											{t("profile.passwordConfirmHint")}
										</p>
									</div>
								</div>
								<div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
									<button
										type="submit"
										disabled={savingEmail}
										className="h-9 px-5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
									>
										{savingEmail ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Check className="w-4 h-4" />
										)}
										{t("profile.updateEmail")}
									</button>
								</div>
							</form>
						)}

						{/* ── Password ── */}
						{activeSection === "password" && (
							<form onSubmit={handlePasswordSave}>
								<div className="px-5 py-4 border-b">
									<h2 className="text-sm font-semibold text-gray-900">
										{t("profile.sections.password")}
									</h2>
									<p className="text-xs text-gray-400 mt-0.5">
										{t("profile.passwordDescription")}
									</p>
								</div>
								<div className="p-5 space-y-4">
									{/* Current password */}
									{[
										{
											label: t("profile.currentPassword"),
											key: "currentPassword" as const,
											show: showCurrent,
											toggle: () => setShowCurrent((v) => !v),
										},
										{
											label: t("profile.newPassword"),
											key: "newPassword" as const,
											show: showNew,
											toggle: () => setShowNew((v) => !v),
										},
										{
											label: t("profile.confirmPassword"),
											key: "confirmPassword" as const,
											show: showConfirm,
											toggle: () => setShowConfirm((v) => !v),
										},
									].map((field) => (
										<div key={field.key} className={fieldClass}>
											<label className={labelClass}>
												{field.label} <span className="text-red-500">*</span>
											</label>
											<div className="relative">
												<input
													type={field.show ? "text" : "password"}
													value={passwordForm[field.key]}
													onChange={(e) =>
														setPasswordForm((p) => ({
															...p,
															[field.key]: e.target.value,
														}))
													}
													className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
												/>
												<button
													type="button"
													onClick={field.toggle}
													className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? "left-3" : "right-3"}`}
												>
													{field.show ? (
														<EyeOff className="w-4 h-4" />
													) : (
														<Eye className="w-4 h-4" />
													)}
												</button>
											</div>
										</div>
									))}

									{/* Password requirements */}
									{passwordForm.newPassword.length > 0 && (
										<div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
											<p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
												{t("addStaffDialog.passwordRequirements")}
											</p>
											<ul className="grid grid-cols-2 gap-1.5">
												{passwordRequirements.map((req) => (
													<li
														key={req.id}
														className="flex items-center gap-2 text-xs"
													>
														{req.valid ? (
															<div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
																<Check className="w-2.5 h-2.5 text-green-600" />
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
																	: "text-gray-400"
															}
														>
															{req.label}
														</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Mismatch warning */}
									{passwordForm.confirmPassword &&
										passwordForm.newPassword !==
											passwordForm.confirmPassword && (
											<div className="flex items-center gap-2 text-red-500 text-xs">
												<AlertCircle className="w-3.5 h-3.5" />
												{t("addStaffDialog.errors.mismatchShort")}
											</div>
										)}
								</div>
								<div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
									<button
										type="submit"
										disabled={savingPassword || !isPasswordStrong}
										className="h-9 px-5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
									>
										{savingPassword ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Lock className="w-4 h-4" />
										)}
										{t("profile.updatePassword")}
									</button>
								</div>
							</form>
						)}

						{/* ── Permissions ── */}
						{activeSection === "permissions" && (
							<div>
								<div className="px-5 py-4 border-b">
									<h2 className="text-sm font-semibold text-gray-900">
										{t("profile.sections.permissions")}
									</h2>
									<p className="text-xs text-gray-400 mt-0.5">
										{t("profile.permissionsDescription")}
									</p>
								</div>

								<div className="p-5 space-y-4">
									{model?.role === "admin" ? (
										<div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
											<div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
												<Shield className="w-4 h-4 text-purple-600" />
											</div>
											<div>
												<p className="text-sm font-semibold text-purple-800">
													{t("staffDetail.adminFullAccess")}
												</p>
												<p className="text-xs text-purple-500 mt-0.5">
													{t("profile.adminAccessNote")}
												</p>
											</div>
										</div>
									) : (
										<>
											{/* Summary bar */}
											{(() => {
												const userPerms: string[] = (
													model?.permissions ?? []
												).map(String);
												const total = Object.keys(PERMISSIONS).length;
												const granted = userPerms.length;
												const pct = Math.round((granted / total) * 100);

												return (
													<div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
														<div className="flex items-center justify-between mb-2">
															<span className="text-xs font-medium text-gray-500">
																{t("profile.permissionsGranted")}
															</span>
															<span className="text-xs font-semibold text-gray-700">
																{granted} / {total}
															</span>
														</div>
														<div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
															<div
																className="h-full bg-gray-700 rounded-full transition-all"
																style={{ width: `${pct}%` }}
															/>
														</div>
													</div>
												);
											})()}

											{/* Groups */}
											{(() => {
												const userPerms: string[] = (
													model?.permissions ?? []
												).map(String);

												return PERMISSION_GROUPS.map((group) => {
													const granted = group.permissions.filter((p) =>
														userPerms.includes(p),
													);
													const none = granted.length === 0;

													return (
														<div
															key={group.labelKey}
															className={`border rounded-lg overflow-hidden ${none ? "opacity-40" : ""}`}
														>
															{/* Group header */}
															<div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
																<span className="text-xs font-semibold text-gray-600">
																	{t(group.labelKey)}
																</span>
																<span
																	className={`text-xs font-medium px-2 py-0.5 rounded-full ${
																		none
																			? "bg-gray-100 text-gray-400"
																			: granted.length ===
																				  group.permissions.length
																				? "bg-green-100 text-green-700"
																				: "bg-amber-100 text-amber-700"
																	}`}
																>
																	{granted.length}/{group.permissions.length}
																</span>
															</div>

															{/* Permission pills */}
															<div className="flex flex-wrap gap-1.5 p-2.5">
																{group.permissions.map((perm) => {
																	const has = userPerms.includes(perm);
																	const label = perm.replace(/^[^_]+_/, "");
																	return (
																		<span
																			key={perm}
																			className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
																				has
																					? "bg-green-100 text-green-800"
																					: "bg-gray-100 text-gray-400 line-through"
																			}`}
																		>
																			{has && (
																				<svg
																					className="w-2.5 h-2.5"
																					viewBox="0 0 10 10"
																					fill="none"
																				>
																					<path
																						d="M2 5l2.5 2.5L8 3"
																						stroke="currentColor"
																						strokeWidth="1.5"
																						strokeLinecap="round"
																						strokeLinejoin="round"
																					/>
																				</svg>
																			)}
																			{label}
																		</span>
																	);
																})}
															</div>
														</div>
													);
												});
											})()}

											{(!model?.permissions ||
												model.permissions.length === 0) && (
												<div className="text-center py-8 text-gray-400 text-sm">
													{t("staffDetail.noPermissions")}
												</div>
											)}
										</>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
