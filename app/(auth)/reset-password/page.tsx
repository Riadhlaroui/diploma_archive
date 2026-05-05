"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Eye,
	EyeOff,
	Check,
	Loader2,
	AlertCircle,
	XCircle,
} from "lucide-react";
import pb from "@/lib/pocketbase";

import { ERROR_KEYS } from "@/lib/constants/errors";

function ResetPasswordForm() {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";
	const router = useRouter();
	const searchParams = useSearchParams();

	const token = searchParams.get("token");

	const [form, setForm] = useState({ password: "", confirmPassword: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);
	const [error, setError] = useState("");

	// Invalid or missing token
	if (!token) {
		return (
			<div className="text-center">
				<div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
					<XCircle className="w-7 h-7 text-red-500" />
				</div>
				<h1 className="text-lg font-semibold text-gray-900 mb-2">
					{t("resetPasswordPage.invalidTitle")}
				</h1>
				<p className="text-sm text-gray-500">
					{t("resetPasswordPage.invalidDescription")}
				</p>
				<button
					onClick={() => router.push("/forgot-password")}
					className="mt-6 w-full h-10 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
				>
					{t("resetPasswordPage.requestNew")}
				</button>
			</div>
		);
	}

	const requirements = useMemo(
		() => [
			{
				id: "len",
				label: t("addStaffDialog.req.length"),
				valid: form.password.length >= 8,
			},
			{
				id: "upper",
				label: t("addStaffDialog.req.upper"),
				valid: /[A-Z]/.test(form.password),
			},
			{
				id: "lower",
				label: t("addStaffDialog.req.lower"),
				valid: /[a-z]/.test(form.password),
			},
			{
				id: "num",
				label: t("addStaffDialog.req.number"),
				valid: /[0-9]/.test(form.password),
			},
			{
				id: "special",
				label: t("addStaffDialog.req.special"),
				valid: /[^A-Za-z0-9]/.test(form.password),
			},
		],
		[form.password, t],
	);

	const isStrong = requirements.every((r) => r.valid);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!isStrong) {
			setError(t(ERROR_KEYS.WEAK_PASSWORD_TITLE));
			return;
		}
		if (form.password !== form.confirmPassword) {
			setError(t(ERROR_KEYS.MISMATCHED_PASSWORDS));
			return;
		}

		try {
			setLoading(true);
			await pb
				.collection("Archive_users")
				.confirmPasswordReset(token, form.password, form.confirmPassword);
			setDone(true);
			// Redirect to login after 3 seconds
			setTimeout(() => router.push("/"), 3000);
		} catch (err: any) {
			if (err?.status === 400) {
				setError(t("resetPasswordPage.tokenExpired"));
			} else {
				setError(t("resetPasswordPage.error"));
			}
		} finally {
			setLoading(false);
		}
	};

	if (done) {
		return (
			<div className="text-center">
				<div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
					<Check className="w-7 h-7 text-green-600" />
				</div>
				<h1 className="text-lg font-semibold text-gray-900 mb-2">
					{t("resetPasswordPage.successTitle")}
				</h1>
				<p className="text-sm text-gray-500">
					{t("resetPasswordPage.successDescription")}
				</p>
				<p className="text-xs text-gray-400 mt-3">
					{t("resetPasswordPage.redirecting")}
				</p>
			</div>
		);
	}

	const inputClass =
		"w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all";

	return (
		<>
			<h1 className="text-lg font-semibold text-gray-900 mb-1">
				{t("resetPasswordPage.title")}
			</h1>
			<p className="text-sm text-gray-500 mb-6">
				{t("resetPasswordPage.description")}
			</p>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* New password */}
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-1.5">
						{t("profile.newPassword")}
					</label>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							value={form.password}
							onChange={(e) =>
								setForm((p) => ({ ...p, password: e.target.value }))
							}
							className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
						/>
						<button
							type="button"
							onClick={() => setShowPassword((v) => !v)}
							className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? "left-3" : "right-3"}`}
						>
							{showPassword ? (
								<EyeOff className="w-4 h-4" />
							) : (
								<Eye className="w-4 h-4" />
							)}
						</button>
					</div>

					{/* Requirements */}
					{form.password.length > 0 && (
						<div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
							<ul className="grid grid-cols-2 gap-1.5">
								{requirements.map((req) => (
									<li
										key={req.id}
										className="flex items-center gap-1.5 text-xs"
									>
										{req.valid ? (
											<div className="w-3.5 h-3.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
												<Check className="w-2 h-2 text-green-600" />
											</div>
										) : (
											<div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
												<div className="w-1 h-1 rounded-full bg-gray-400" />
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
				</div>

				{/* Confirm password */}
				<div>
					<label className="block text-xs font-medium text-gray-500 mb-1.5">
						{t("profile.confirmPassword")}
					</label>
					<div className="relative">
						<input
							type={showConfirm ? "text" : "password"}
							value={form.confirmPassword}
							onChange={(e) =>
								setForm((p) => ({ ...p, confirmPassword: e.target.value }))
							}
							className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
						/>
						<button
							type="button"
							onClick={() => setShowConfirm((v) => !v)}
							className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRtl ? "left-3" : "right-3"}`}
						>
							{showConfirm ? (
								<EyeOff className="w-4 h-4" />
							) : (
								<Eye className="w-4 h-4" />
							)}
						</button>
					</div>
					{form.confirmPassword && form.password !== form.confirmPassword && (
						<p className="text-xs text-red-500 mt-1 flex items-center gap-1">
							<AlertCircle className="w-3 h-3" />
							{t(ERROR_KEYS.MISMATCHED_PASSWORDS_SHORT)}
						</p>
					)}
				</div>

				{error && (
					<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
						<AlertCircle className="w-4 h-4 flex-shrink-0" />
						{error}
					</div>
				)}

				<button
					type="submit"
					disabled={
						loading || !isStrong || form.password !== form.confirmPassword
					}
					className="w-full h-10 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
				>
					{loading ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						t("resetPasswordPage.submitButton")
					)}
				</button>
			</form>
		</>
	);
}

export default function ResetPasswordPage() {
	const { i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F8F6]"
			dir={isRtl ? "rtl" : "ltr"}
		>
			<div className="w-full max-w-sm">
				<div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
					<Suspense
						fallback={
							<div className="text-center text-sm text-gray-400">
								Loading...
							</div>
						}
					>
						<ResetPasswordForm />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
