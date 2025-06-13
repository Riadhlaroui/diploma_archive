"use client";

import React, { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { X } from "lucide-react";
import {
	addSpecialty,
	isSpecialtyNameTaken,
} from "../../app/src/services/specialtyService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AddSpecialtyDialogProps {
	open: boolean;
	onClose: () => void;
	onOpenChange: (open: boolean) => void;
	majorId: string | null;
}

const AddSpecialtyDialog = ({
	open,
	onClose,
	onOpenChange,
	majorId,
}: AddSpecialtyDialogProps) => {
	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";
	const [name, setName] = useState("");
	const [nameTaken, setNameTaken] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const checkName = async () => {
			if (!name.trim() || !majorId) {
				setNameTaken(false);
				return;
			}

			try {
				const taken = await isSpecialtyNameTaken(name, majorId);
				if (isMounted) setNameTaken(taken);
			} catch {
				if (isMounted) setNameTaken(false);
			}
		};

		checkName();

		return () => {
			isMounted = false;
		};
	}, [name, majorId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error(t("addSpecialty.errors.nameRequired"));
			return;
		}

		if (!majorId) {
			toast.error("Major ID is required.");
			return;
		}

		if (nameTaken) {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold text-[15px]">
							{t("addSpecialty.errors.nameTaken.title")}
						</div>
						<div className="text-sm">
							{t("addSpecialty.errors.nameTaken.desc")}
						</div>
					</div>
				</div>
			);
			return;
		}

		try {
			await addSpecialty({ name, majorId });
			toast.success(t("addSpecialty.success"));
			onClose();
			onOpenChange(false);
			setName("");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
		} catch (error: any) {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold">
							{t("addSpecialty.errors.general.title")}
						</div>
						<div className="text-sm">
							{t("addSpecialty.errors.general.desc")}
						</div>
					</div>
				</div>
			);
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white dark:bg-gray-900 rounded-[3px] shadow-lg w-full max-w-md p-6 relative">
				<button
					onClick={onClose}
					className={`absolute top-3 ${
						isRtl ? "left-3" : "right-3"
					} text-gray-500 hover:text-black dark:hover:text-white hover:cursor-pointer`}
				>
					<X />
				</button>

				<h2 className="text-xl font-semibold">{t("addSpecialty.title")}</h2>

				<form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
					<Separator />
					<div className="flex gap-4 w-full">
						<div className="relative w-full">
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className={`peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none ${
									nameTaken ? "border-red-600" : ""
								}`}
								dir={isRtl ? "rtl" : "ltr"}
								placeholder=""
								aria-invalid={nameTaken}
								aria-describedby="name-error"
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								{t("addSpecialty.nameLabel")}
								<span className="text-[#D81212]">*</span>
							</label>
							{nameTaken && (
								<p
									id="name-error"
									className="text-red-600 text-sm mt-1 select-none"
								>
									{t("addSpecialty.errors.nameTaken.title")}
								</p>
							)}
						</div>
					</div>

					<Separator />

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="bg-gray-300 text-black px-4 py-2 rounded-[3px] hover:bg-gray-400 hover:cursor-pointer transition-colors duration-200"
						>
							{t("addSpecialty.cancel")}
						</button>
						<button
							type="submit"
							disabled={nameTaken}
							className={`bg-black text-white px-4 py-2 rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200 ${
								nameTaken ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{t("addSpecialty.submit")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddSpecialtyDialog;
