"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import pb from "@/lib/pocketbase";

export default function ForgotPasswordPage() {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email.trim() || !emailRegex.test(email)) {
			setError(t("forgotPasswordPage.invalidEmail"));
			return;
		}

		try {
			setLoading(true);
			await pb.collection("Archive_users").requestPasswordReset(email.trim());
			// Always show success even if email doesn't exist — prevents email enumeration
			setSent(true);
		} catch {
			// Still show success to prevent email enumeration attacks
			setSent(true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8F8F6]"
			dir={isRtl ? "rtl" : "ltr"}
		>
			<div className="w-full max-w-sm">
				{/* Back */}
				<button
					onClick={() => router.push("/")}
					className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					{t("common.back")}
				</button>

				<div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
					{sent ? (
						/* Success state */
						<div className="text-center">
							<div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
								<CheckCircle2 className="w-7 h-7 text-green-600" />
							</div>
							<h1 className="text-lg font-semibold text-gray-900 mb-2">
								{t("forgotPasswordPage.sentTitle")}
							</h1>
							<p className="text-sm text-gray-500 leading-relaxed">
								{t("forgotPasswordPage.sentDescription")}
							</p>
							<p className="text-xs text-gray-400 mt-4">
								{t("forgotPasswordPage.spamNote")}
							</p>
							<button
								onClick={() => router.push("/")}
								className="mt-6 w-full h-10 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
							>
								{t("forgotPasswordPage.backToLogin")}
							</button>
						</div>
					) : (
						/* Form state */
						<>
							<div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
								<Mail className="w-5 h-5 text-gray-600" />
							</div>

							<h1 className="text-lg font-semibold text-gray-900 mb-1">
								{t("forgotPasswordPage.title")}
							</h1>
							<p className="text-sm text-gray-500 mb-6">
								{t("forgotPasswordPage.description")}
							</p>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-xs font-medium text-gray-500 mb-1.5">
										{t("email")}
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setError("");
										}}
										placeholder="your@email.com"
										autoFocus
										className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all"
									/>
									{error && (
										<p className="text-xs text-red-500 mt-1">{error}</p>
									)}
								</div>

								<button
									type="submit"
									disabled={loading || !email.trim()}
									className="w-full h-10 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
								>
									{loading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										t("forgotPasswordPage.sendButton")
									)}
								</button>
							</form>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
