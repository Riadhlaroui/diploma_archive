import * as Dialog from "@radix-ui/react-dialog";
import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Separator } from "./ui/separator";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const AddStaffDialog = ({ open, onOpenChange }: Props) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	const togglePasswordVisibility = () => {
		setIsPasswordVisible((prev) => !prev);
	};

	const toggleConfirmPasswordVisibility = () => {
		setIsConfirmPasswordVisible((prev) => !prev);
	};

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Form submitted");
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
				<Dialog.Content className="w-full max-w-lg fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-none shadow-lg">
					<Dialog.Title className="text-lg font-semibold">
						Add Staff Member
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
									/>
									<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
										First name
										<span className="text-[#D81212]">*</span>
									</label>
								</div>

								<div className="relative w-1/2">
									<input
										type="text"
										className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
										placeholder=""
									/>
									<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
										Last name
										<span className="text-[#D81212]">*</span>
									</label>
								</div>
							</div>

							<div className="relative">
								<input
									type="number"
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
									Phone Number
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
									Email
									<span className="text-[#D81212]">*</span>
								</label>
							</div>

							<div className="relative">
								<input
									type={isPasswordVisible ? "text" : "password"}
									className="peer w-full bg-[#E3E8ED] h-[4rem] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none placeholder-transparent"
									onChange={(e) => setPassword(e.target.value)}
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
									Password
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
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
									Confirm password
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
						</div>

						<Separator />

						<div className="flex justify-end gap-3 mt-4">
							<Dialog.Close asChild>
								<button
									type="button"
									className="bg-gray-300 text-black px-4 py-2 rounded-[3px] hover:bg-gray-400 hover:cursor-pointer"
								>
									Cancel
								</button>
							</Dialog.Close>
							<button
								type="submit"
								className="bg-black text-white px-4 py-2 rounded-[3px] hover:cursor-pointer"
							>
								Submit
							</button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default AddStaffDialog;
