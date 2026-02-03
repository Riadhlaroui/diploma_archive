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
	getDepartmentByNameAndFaculty,
	updateDepartment,
} from "@/app/src/services/departmentService";

type Department = {
	id: string;
	name: string;
	facultyId: string; // Add facultyId
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
			// Use the new function with facultyId
			const existing = await getDepartmentByNameAndFaculty(
				name,
				user.facultyId,
			);

			if (existing && existing.id !== user.id) {
				toast.error(
					<div>
						<div className="font-semibold">
							{t(
								"editDepartmentDialog.errors.nameExistsTitle",
								"Department name already exists",
							)}
						</div>
						<div className="text-sm">
							{t(
								"editDepartmentDialog.errors.nameExistsDesc",
								"Please choose a different name.",
							)}
						</div>
					</div>,
				);
				return;
			}

			await updateDepartment(user.id, { name });
			toast.success(
				t(
					"editDepartmentDialog.successMessage",
					"Department updated successfully",
				),
			);
			onOpenChange(false);
		} catch (error) {
			console.error("Error updating Department:", error);
			toast.error(
				t("editDepartmentDialog.errorMessage", "Failed to update Department"),
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
							"Update the Department name.",
						)}
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col mt-[-8px] gap-2 px-4"
				>
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

					<div className="flex w-full gap-2 mt-auto">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50/40 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
						>
							{t("editDepartmentDialog.cancelButton", "Cancel")}
						</button>
						<button
							type="submit"
							className="bg-black flex-1 rounded-xl text-white px-4 py-2 w-full hover:bg-gray-900 transition hover:cursor-pointer"
						>
							{t("editDepartmentDialog.saveButton", "Save")}
						</button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
