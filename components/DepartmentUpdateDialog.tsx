"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	getDepartmentByName,
	updateDepartment,
} from "@/app/src/services/departmentService";

type Department = {
	id: string;
	name: string;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: Department | null;
};

export function DepartmentUpdateDialog({ open, onOpenChange, user }: Props) {
	const { t } = useTranslation();
	const [name, setName] = useState("");

	useEffect(() => {
		if (user) {
			setName(user.name);
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		try {
			const existing = await getDepartmentByName(name);
			if (existing && existing.id !== user.id) {
				toast.error(
					<div>
						<div className="font-semibold">
							{t(
								"editDepartmentDialog.errors.nameExistsTitle",
								"Department name already exists"
							)}
						</div>
						<div className="text-sm">
							{t(
								"editDepartmentDialog.errors.nameExistsDesc",
								"Please choose a different name."
							)}
						</div>
					</div>
				);
				return;
			}

			await updateDepartment(user.id, { name });
			toast.success(
				t(
					"editDepartmentDialog.successMessage",
					"Department updated successfully"
				)
			);
			onOpenChange(false);
		} catch (error) {
			console.error("Error updating Department:", error);
			toast.error(
				t("editDepartmentDialog.errorMessage", "Failed to update Department")
			);
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className="text-xl font-semibold">
						{t("editDepartmentDialog.title", "Edit Department")}
					</SheetTitle>
					<SheetDescription>
						{t(
							"editDepartmentDialog.description",
							"Update the Department name."
						)}
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4">
					<Separator />

					<div className="relative">
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
						/>
						<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm peer-focus:text-black dark:peer-focus:text-white">
							{t("editDepartmentDialog.departmentName", "Department Name")}
							<span className="text-[#D81212]">*</span>
						</label>
					</div>

					<Separator />

					<div className="flex w-full gap-2 p-4 mt-auto">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="bg-gray-300 text-black px-4 py-2 w-full rounded-[3px] hover:bg-gray-400 transition hover:cursor-pointer"
						>
							{t("editDepartmentDialog.cancelButton", "Cancel")}
						</button>
						<button
							type="submit"
							className="bg-black text-white px-4 py-2 w-full rounded-[3px] hover:bg-gray-900 transition hover:cursor-pointer"
						>
							{t("editDepartmentDialog.saveButton", "Save")}
						</button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
