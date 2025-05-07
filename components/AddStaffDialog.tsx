import * as Dialog from "@radix-ui/react-dialog";
import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Separator } from "./ui/separator";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

import { createUser } from "./../app/src/services/userService";
import { toast } from "sonner";

import { useTranslation } from "react-i18next";

const AddStaffDialog = ({ open, onOpenChange }: Props) => {
	const { t } = useTranslation();

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const togglePasswordVisibility = () => {
		setIsPasswordVisible((prev) => !prev);
	};

	const toggleConfirmPasswordVisibility = () => {
		setIsConfirmPasswordVisible((prev) => !prev);
	};

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
						<div className="font-semibold">
							{t("addStaffDialog.errors.mismatchTitle")}
						</div>
						<div className="text-sm ">
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
						<div className="text-sm ">
							{t("addStaffDialog.errors.weakDesc")}
						</div>
					</div>
				</div>
			);
			return;
		}

		console.log("Form submitted:", {
			email,
			password,
			firstName,
			lastName,
			phone: phoneNumber,
			role,
		});

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
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error(t("addStaffDialog.errors.userCreatedError"));
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
				<Dialog.Content
					className="w-full max-w-lg fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-none shadow-lg"
					onPointerDownOutside={(e) => e.preventDefault()}
				>
					<Dialog.Title className="text-lg font-semibold">
						{t("addStaffDialog.title")}
					</Dialog.Title>

					<Dialog.Close className="absolute top-2 right-2 text-gray-500 hover:text-black">
						<X />
					</Dialog.Close>

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
									className="absolute inset-y-0 right-3 flex items-center text-gray-500"
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
									className="absolute inset-y-0 right-3 flex items-center text-gray-500"
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

						<div className="flex justify-end gap-3 mt-4">
							<Dialog.Close asChild>
								<button
									type="button"
									className="bg-gray-300 text-black px-4 py-2 rounded-[3px] hover:cursor-pointer"
								>
									{t("addStaffDialog.cancelButton")}
								</button>
							</Dialog.Close>
							<button
								type="submit"
								className="bg-black text-white px-4 py-2 rounded-[3px] hover:cursor-pointer"
							>
								{t("addStaffDialog.submitButton")}
							</button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default AddStaffDialog;
