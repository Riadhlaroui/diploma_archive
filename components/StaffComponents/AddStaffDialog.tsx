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
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { createUser } from "../../app/src/services/userService";
import { Separator } from "../ui/separator";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const AddStaffDialog = ({ open, onOpenChange }: Props) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	// --- Form State ---
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState<"admin" | "staff">("staff");

	// --- UI State ---
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	// --- Password Logic ---
	const passwordRequirements = useMemo(
		() => [
			{
				id: "len",
				label: t("addStaffDialog.req.length", "At least 8 characters"),
				valid: password.length >= 8,
			},
			{
				id: "upper",
				label: t("addStaffDialog.req.upper", "One uppercase letter"),
				valid: /[A-Z]/.test(password),
			},
			{
				id: "lower",
				label: t("addStaffDialog.req.lower", "One lowercase letter"),
				valid: /[a-z]/.test(password),
			},
			{
				id: "num",
				label: t("addStaffDialog.req.number", "One number"),
				valid: /[0-9]/.test(password),
			},
			{
				id: "special",
				label: t("addStaffDialog.req.special", "One special character"),
				valid: /[^A-Za-z0-9]/.test(password),
			},
		],
		[password, t],
	);

	const isPasswordStrong = passwordRequirements.every((req) => req.valid);

	const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);
	const toggleConfirmPasswordVisibility = () =>
		setIsConfirmPasswordVisible((prev) => !prev);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error(
				t("addStaffDialog.errors.mismatchTitle", "Passwords do not match"),
			);
			return;
		}

		if (
			!firstName ||
			!lastName ||
			!phoneNumber ||
			!email ||
			!password ||
			!confirmPassword ||
			!role
		) {
			toast.error(
				t("addStaffDialog.errors.missingTitle", "Please fill in all fields"),
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
				email,
				password,
				firstName,
				lastName,
				phone: phoneNumber,
				role,
			});
			toast.success(t("addStaffDialog.userCreatedSuccess"));
			onOpenChange(false);
		} catch (error: any) {
			console.error("Error creating user:", error);
			toast.error(t("addStaffDialog.errors.userCreatedError"));
		}
	};

	if (!open) return null;

	const inputContainerClass = "flex flex-col gap-1.5";
	const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";
	const inputClass =
		"flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:focus:ring-white transition-all duration-200";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
			<div
				className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
				dir={isRtl ? "rtl" : "ltr"}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						{t("addStaffDialog.title")}
					</h2>
					<button
						onClick={() => onOpenChange(false)}
						className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
						aria-label={t("addStaffDialog.close")}
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="px-6 py-6 overflow-y-auto">
					<form
						id="add-staff-form"
						onSubmit={handleSubmit}
						className="space-y-5"
					>
						<div className="flex flex-col sm:flex-row gap-4">
							<div className={`w-full ${inputContainerClass}`}>
								<label className={labelClass}>
									{t("addStaffDialog.firstName")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className={inputClass}
									onChange={(e) => setFirstName(e.target.value)}
								/>
							</div>

							<div className={`w-full ${inputContainerClass}`}>
								<label className={labelClass}>
									{t("addStaffDialog.lastName")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									className={inputClass}
									onChange={(e) => setLastName(e.target.value)}
								/>
							</div>
						</div>

						<div className={inputContainerClass}>
							<label className={labelClass}>
								{t("addStaffDialog.email")}{" "}
								<span className="text-red-500">*</span>
							</label>
							<input
								type="email"
								className={inputClass}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>

						<div className={inputContainerClass}>
							<label className={labelClass}>
								{t("addStaffDialog.phoneNumber")}{" "}
								<span className="text-red-500">*</span>
							</label>
							<input
								type="tel"
								className={inputClass}
								onChange={(e) => setPhoneNumber(e.target.value)}
							/>
						</div>

						<Separator className="my-2" />

						<div className="space-y-4">
							<div className={inputContainerClass}>
								<label className={labelClass}>
									{t("addStaffDialog.password")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<input
										type={isPasswordVisible ? "text" : "password"}
										className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
										onChange={(e) => setPassword(e.target.value)}
									/>
									<button
										type="button"
										onClick={togglePasswordVisibility}
										className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
											isRtl ? "left-3" : "right-3"
										}`}
									>
										{isPasswordVisible ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>

								{password.length > 0 && (
									<div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md mt-2 border border-gray-100 dark:border-gray-800">
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
														<div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
															<div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
														</div>
													)}
													<span
														className={
															req.valid
																? "text-green-700 dark:text-green-400 font-medium"
																: "text-gray-500 dark:text-gray-400"
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

							<div className={inputContainerClass}>
								<label className={labelClass}>
									{t("addStaffDialog.confirmPassword")}{" "}
									<span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<input
										type={isConfirmPasswordVisible ? "text" : "password"}
										className={`${inputClass} ${isRtl ? "pl-10" : "pr-10"}`}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
									<button
										type="button"
										onClick={toggleConfirmPasswordVisibility}
										className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
											isRtl ? "left-3" : "right-3"
										}`}
									>
										{isConfirmPasswordVisible ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
								{confirmPassword && password !== confirmPassword && (
									<div className="flex items-center gap-2 text-red-500 text-xs mt-1">
										<AlertCircle className="w-3 h-3" />
										{t(
											"addStaffDialog.errors.mismatchShort",
											"Passwords do not match",
										)}
									</div>
								)}
							</div>
						</div>

						<div className={inputContainerClass}>
							<label className={labelClass}>
								{t("addStaffDialog.roleLabel")}
							</label>
							<Select
								value={role}
								onValueChange={(value) => setRole(value as "admin" | "staff")}
							>
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
					</form>
				</div>

				{/* Footer Actions */}
				<div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 flex justify-end gap-3">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
					>
						{t("addStaffDialog.cancelButton")}
					</button>
					<button
						type="submit"
						form="add-staff-form"
						className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						disabled={!isPasswordStrong || !email || !firstName}
					>
						{t("addStaffDialog.submitButton")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddStaffDialog;
