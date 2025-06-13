import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
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

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);
	const toggleConfirmPasswordVisibility = () =>
		setIsConfirmPasswordVisible((prev) => !prev);

	const calculatePasswordStrength = (password: string): number => {
		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/[a-z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^A-Za-z0-9]/.test(password)) strength++;
		return strength;
	};

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState(0);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState<"admin" | "staff">("staff");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div>{t("addStaffDialog.errors.mismatchTitle")}</div>
						<div className="text-sm">
							{t("addStaffDialog.errors.mismatchDesc")}
						</div>
					</div>
				</div>
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
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold">
							{t("addStaffDialog.errors.missingTitle")}
						</div>
						<div className="text-sm">
							{t("addStaffDialog.errors.missingDesc")}
						</div>
					</div>
				</div>
			);
			return;
		}

		if (strength < 3) {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold">
							{t("addStaffDialog.errors.weakTitle")}
						</div>
						<div className="text-sm">{t("addStaffDialog.errors.weakDesc")}</div>
					</div>
				</div>
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.response?.status === 400) {
				toast.error(t("addStaffDialog.errors.userCreatedError"));
			} else {
				console.error("Error creating user:", error);
				toast.error(t("addStaffDialog.errors.userCreatedError"));
			}
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white dark:bg-gray-900 rounded-none shadow-lg w-full max-w-md p-6 relative">
				<button
					onClick={() => onOpenChange(false)}
					className={`absolute top-3 ${
						isRtl ? "left-3" : "right-3"
					} text-gray-500 hover:text-black dark:hover:text-white hover:cursor-pointer`}
					aria-label={t("addStaffDialog.close")}
				>
					<X />
				</button>

				<h2 className="text-xl font-semibold">{t("addStaffDialog.title")}</h2>

				<form onSubmit={handleSubmit} className="space-y-4 mt-2">
					{/* Your form inputs here */}
					<Separator />
					<div className="flex flex-col gap-[0.7rem]">
						<div className="flex gap-4">
							<div className="relative w-1/2">
								<input
									type="text"
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
									onChange={(e) => setFirstName(e.target.value)}
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
									{t("addStaffDialog.firstName")}
									<span className="text-[#D81212]">*</span>
								</label>
							</div>

							<div className="relative w-1/2">
								<input
									type="text"
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
									onChange={(e) => setLastName(e.target.value)}
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
									{t("addStaffDialog.lastName")}
									<span className="text-[#D81212]">*</span>
								</label>
							</div>
						</div>

						<div className="relative">
							<input
								type="number"
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
								onChange={(e) => setPhoneNumber(e.target.value)}
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								{t("addStaffDialog.phoneNumber")}
								<span className="text-[#D81212]">*</span>
							</label>
						</div>
					</div>

					<div className="flex flex-col gap-[0.7rem]">
						<div className="relative">
							<input
								type="email"
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
								onChange={(e) => setEmail(e.target.value)}
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								{t("addStaffDialog.email")}
								<span className="text-[#D81212]">*</span>
							</label>
						</div>

						<div className="relative">
							<meter
								min="0"
								max="5"
								value={strength}
								low={2}
								high={4}
								optimum={5}
								className="absolute top-1 right-3 w-[60%] h-3 rounded-full bg-gray-200"
							></meter>

							<input
								type={isPasswordVisible ? "text" : "password"}
								className="peer w-full bg-[#E3E8ED] h-[4rem] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none placeholder-transparent"
								onChange={(e) => {
									const value = e.target.value;
									setPassword(value);
									setStrength(calculatePasswordStrength(value));
								}}
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								{t("addStaffDialog.password")}{" "}
								<span className="text-[#D81212]">*</span>
							</label>

							<button
								type="button"
								onClick={togglePasswordVisibility}
								className={`absolute inset-y-0 flex items-center text-gray-500 ${
									i18n.language === "ar" ? "left-3 mt-6" : "right-3"
								}`}
							>
								{isPasswordVisible ? (
									<EyeOff className="w-5 h-5" />
								) : (
									<Eye className="w-5 h-5" />
								)}
							</button>
						</div>

						<div className="relative">
							<input
								type={isConfirmPasswordVisible ? "text" : "password"}
								className="peer w-full bg-[#E3E8ED] h-[4rem] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none placeholder-transparent"
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								{t("addStaffDialog.confirmPassword")}
								<span className="text-[#D81212]">*</span>
							</label>
							<button
								type="button"
								onClick={toggleConfirmPasswordVisibility}
								className={`absolute inset-y-0 flex items-center text-gray-500 ${
									i18n.language === "ar" ? "left-3 mt-6" : "right-3"
								}`}
							>
								{isConfirmPasswordVisible ? (
									<EyeOff className="w-5 h-5" />
								) : (
									<Eye className="w-5 h-5" />
								)}
							</button>
						</div>

						<div>
							<Select
								value={role}
								onValueChange={(value) => setRole(value as "admin" | "staff")}
							>
								<SelectTrigger className="w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px]  focus:outline-none">
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

					<Separator />

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="bg-gray-300 text-black px-4 py-2 rounded-[3px] hover:bg-gray-400 hover:cursor-pointer transition-colors duration-200"
						>
							{t("addStaffDialog.cancelButton")}
						</button>
						<button
							type="submit"
							className="bg-black text-white px-4 py-2 rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200"
						>
							{t("addStaffDialog.submitButton")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddStaffDialog;
