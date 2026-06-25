"use client";

import "@/lib/i18n/i18n";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import FullScreenLoader from "@/components/FullScreenLoader";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSignInForm } from "@/app/src/features/auth/hooks/useSignInForm";
import { DecorIcon } from "@/components/ui/decor-icon";
import { cn } from "@/lib/utils";

export default function SignIn() {
	const {
		email,
		setEmail,
		password,
		setPassword,
		isLoading,
		isPasswordVisible,
		checkingAuth,
		lockoutSeconds, // ← new
		formatCountdown, // ← new
		t,
		i18n,
		switchLanguage,
		togglePasswordVisibility,
		handleLogin,
	} = useSignInForm();

	const isRtl = i18n.language === "ar";

	if (checkingAuth) return <FullScreenLoader />;

	return (
		<div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-6 md:px-8">
			{/* Language Switcher */}
			<div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 p-2 flex items-center">
				<Select
					value={i18n.language}
					onValueChange={(value: string) =>
						switchLanguage(value as "en" | "fr" | "ar")
					}
				>
					<SelectTrigger
						id="language-select"
						className={`w-auto flex items-center gap-2 px-3 dark:bg-[#1f1f1f] dark:text-white ${
							isRtl ? "flex-row-reverse" : "flex-row"
						}`}
					>
						<span className="font-semibold">{t("language")}</span>
						<SelectValue placeholder="Select Language" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="en">English</SelectItem>
						<SelectItem value="fr">Français</SelectItem>
						<SelectItem value="ar">العربية</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div
				className={cn(
					"relative flex w-full max-w-md flex-col justify-between p-6 md:p-8",
					"dark:bg-[radial-gradient(50%_80%_at_20%_0%,--theme(--color-foreground/.1),transparent)]",
				)}
			>
				<div className="absolute -inset-y-6 -left-px w-px bg-border" />
				<div className="absolute -inset-y-6 -right-px w-px bg-border" />
				<div className="absolute -inset-x-6 -top-px h-px bg-border" />
				<div className="absolute -inset-x-6 -bottom-px h-px bg-border" />
				<DecorIcon position="top-left" />
				<DecorIcon position="bottom-right" />

				<div className="w-full max-w-md animate-in space-y-8">
					<div className="flex flex-col space-y-1">
						<h1
							dir={isRtl ? "rtl" : "ltr"}
							className="font-bold text-2xl tracking-wide"
						>
							{t("welcome")}
						</h1>
					</div>

					<div className="space-y-4">
						<form
							onSubmit={handleLogin}
							dir={isRtl ? "rtl" : "ltr"}
							className="space-y-4"
						>
							<div className="flex flex-col gap-[0.7rem]">
								<div className="relative">
									<input
										type="email"
										className="peer w-full h-16 bg-[#D7DDE3] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3.5px] px-3 pt-6 pb-2 focus:outline-none"
										dir={isRtl ? "rtl" : "ltr"}
										onChange={(e) => setEmail(e.target.value)}
									/>
									<label
										className={`absolute top-2 ${isRtl ? "right-3" : "left-3"} text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white`}
									>
										{t("sign-in.email")}
										<span className="text-[#D81212]">*</span>
									</label>
								</div>

								<div className="relative">
									<input
										type={isPasswordVisible ? "text" : "password"}
										className={`peer w-full bg-[#D7DDE3] h-16 dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3.5px] px-3 pt-6 pb-2 focus:outline-none placeholder-transparent ${
											isRtl ? "pl-10" : "pr-10"
										}`}
										onChange={(e) => setPassword(e.target.value)}
										dir={isRtl ? "rtl" : "ltr"}
									/>
									<label
										className={`absolute top-2 ${isRtl ? "right-3" : "left-3"} text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white`}
									>
										{t("sign-in.password")}
										<span className="text-[#D81212]">*</span>
									</label>
									<button
										type="button"
										onClick={togglePasswordVisibility}
										className={`absolute top-1/2 -translate-y-1/2 ${
											isRtl ? "left-3" : "right-3"
										} flex items-center text-gray-500`}
									>
										{isPasswordVisible ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<div className="w-full inline-block group relative bg-[#c2c0c0c8] p-0.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-[#bbbbbbc8]">
									<Button
										type="submit"
										disabled={isLoading || lockoutSeconds > 0}
										className="w-full h-16 text-lg cursor-pointer font-semibold bg-black hover:bg-neutral-900 text-white rounded-lg transition-all duration-300 group-hover:-translate-y-0.5 border-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
									>
										{isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
										{lockoutSeconds > 0 ? (
											// Show countdown inside button when locked out
											<span className="flex items-center gap-2">
												<span className="font-mono text-xl tracking-widest">
													{formatCountdown(lockoutSeconds)}
												</span>
											</span>
										) : (
											t("sign-in.button")
										)}
									</Button>
								</div>

								{/* Warning message below button */}
								{lockoutSeconds > 0 && (
									<p
										dir={isRtl ? "rtl" : "ltr"}
										className="text-center text-sm text-red-500 animate-in fade-in duration-300"
									>
										{t("errors.sign-in.tooManyAttempts")}
									</p>
								)}
							</div>
						</form>
					</div>

					<p
						dir={isRtl ? "rtl" : "ltr"}
						className="text-muted-foreground text-sm"
					>
						{t("sign-in.forgotPassword")}{" "}
						<a href="/reset-password" className="text-primary hover:underline">
							{t("sign-in.resetPassword")}
						</a>
						<br />
					</p>
				</div>
			</div>
		</div>
	);
}
