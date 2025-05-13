// UserUpdateDialog.tsx
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { UserList } from "@/app/src/services/userService";
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
import { Separator } from "./ui/separator";
import { useTranslation } from "react-i18next";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserList | null;
};

export function UserUpdateDialog({ open, onOpenChange, user }: Props) {
	const { t } = useTranslation();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"admin" | "staff">("staff");

	useEffect(() => {
		if (user) {
			setFirstName(user.firstName || "");
			setLastName(user.lastName || "");
			setPhoneNumber(user.phone || "");
			setEmail(user.email || "");
			setRole(user.role as "admin" | "staff");
		}
	}, [user]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Submit new values:", {
			firstName,
			lastName,
			phoneNumber,
			email,
			role,
		});
		onOpenChange(false);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className=" text-xl font-semibold">
						{t("editUserDialog.title")}
					</SheetTitle>
					<SheetDescription>{t("editUserDialog.description")}</SheetDescription>
				</SheetHeader>
				<form
					onSubmit={handleSubmit}
					className="flex-1 flex flex-col px-4 gap-4"
				>
					<Separator />
					<div className="flex flex-col gap-[0.7rem]">
						<div className="flex gap-4">
							<div className="relative w-1/2">
								<input
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
									{t("addStaffDialog.firstName")}
									<span className="text-[#D81212]">*</span>
								</label>
							</div>

							<div className="relative w-1/2">
								<input
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
									{t("addStaffDialog.lastName")}
									<span className="text-[#D81212]">*</span>
								</label>
							</div>
						</div>

						<div className="relative">
							<input
								type="tel"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
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
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								{t("addStaffDialog.email")}
								<span className="text-[#D81212]">*</span>
							</label>
						</div>

						<div>
							<Select
								value={role}
								onValueChange={(value) => setRole(value as "admin" | "staff")}
							>
								<SelectTrigger className="w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] focus:outline-none">
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

					<div className="flex w-full gap-2 p-4 mt-auto">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="bg-gray-300 text-black px-4 py-2 w-full rounded-[3px] hover:bg-gray-400 hover:cursor-pointer transition-colors duration-200"
						>
							{t("addStaffDialog.cancelButton")}
						</button>
						<button
							type="submit"
							className="bg-black text-white px-4 py-2 w-full rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200"
						>
							{t("addStaffDialog.submitButton")}
						</button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
