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
import { getMajorByName, updateMajor } from "@/app/src/services/majorService";

type Major = {
	id: string;
	name: string;
	fieldId: string;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	major: Major | null;
};

export function MajorUpdateDialog({ open, onOpenChange, major }: Props) {
	const { t } = useTranslation();
	const [name, setName] = useState("");

	useEffect(() => {
		if (major) {
			setName(major.name);
		}
	}, [major]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!major) return;

		try {
			const existing = await getMajorByName(name, major.fieldId);
			if (existing && existing.id !== major.id) {
				toast.error(
					<div>
						<div className="font-semibold">
							{t(
								"editMajorDialog.errors.nameExistsTitle",
								"Major name already exists"
							)}
						</div>
						<div className="text-sm">
							{t(
								"editMajorDialog.errors.nameExistsDesc",
								"Please choose a different name."
							)}
						</div>
					</div>
				);
				return;
			}

			await updateMajor(major.id, { name });
			toast.success(
				t("editMajorDialog.successMessage", "Major updated successfully")
			);
			onOpenChange(false);
		} catch (error) {
			console.error("Error updating major:", error);
			toast.error(t("editMajorDialog.errorMessage", "Failed to update major"));
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className="text-xl font-semibold">
						{t("editMajorDialog.title", "Edit Major")}
					</SheetTitle>
					<SheetDescription>
						{t("editMajorDialog.description", "Update the major name.")}
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pt-4">
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
							{t("editMajorDialog.majorName", "Major Name")}
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
							{t("editMajorDialog.cancelButton", "Cancel")}
						</button>
						<button
							type="submit"
							className="bg-black text-white px-4 py-2 w-full rounded-[3px] hover:bg-gray-900 transition hover:cursor-pointer"
						>
							{t("editMajorDialog.saveButton", "Save")}
						</button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
