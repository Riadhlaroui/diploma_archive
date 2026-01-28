"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { X } from "lucide-react";
import {
	addDepartment,
	isDepartmentNameTaken,
} from "../../app/src/services/departmentService";
import { toast } from "sonner";

const AddDepartmentDialog = ({
	onClose,
	facultyId,
}: {
	onClose: () => void;
	facultyId: string;
}) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";
	const [name, setName] = useState("");
	const [nameTaken, setNameTaken] = useState(false);
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		if (!name.trim()) {
			setNameTaken(false);
			return;
		}

		const delayDebounce = setTimeout(async () => {
			setChecking(true);
			try {
				const taken = await isDepartmentNameTaken(name.trim(), facultyId);
				setNameTaken(taken);
			} catch {
				setNameTaken(false);
			} finally {
				setChecking(false);
			}
		}, 500); // debounce delay

		return () => clearTimeout(delayDebounce);
	}, [name, facultyId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedName = name.trim();

		if (!trimmedName) {
			toast.error(t("addDepartment.nameRequired"));
			return;
		}

		if (nameTaken) {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold text-[15px]">
							{t("addDepartment.duplicateTitle")}
						</div>
						<div className="text-sm">{t("addDepartment.duplicateMessage")}</div>
					</div>
				</div>,
			);
			return;
		}

		try {
			await addDepartment({
				name: trimmedName,
				code: trimmedName.substring(0, 3).toUpperCase(),
				facultyId,
			});
			toast.success(t("addDepartment.success"));
			onClose();
		} catch {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold">
							{t("addDepartment.errors.genericTitle")}
						</div>
						<div className="text-sm">
							{t("addDepartment.errors.genericDesc")}
						</div>
					</div>
				</div>,
			);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white dark:bg-gray-900 rounded-[3px] shadow-lg w-full max-w-md p-6 relative">
				<button
					onClick={onClose}
					className={`text-gray-400 absolute top-3 ${
						isRtl ? "left-3" : "right-3"
					}  hover:text-gray-900 dark:hover:text-white transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800`}
				>
					<X className="w-5 h-5" />
				</button>

				<h2 className="text-xl font-semibold">{t("addDepartment.title")}</h2>

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
								placeholder=""
								dir={isRtl ? "rtl" : "ltr"}
								aria-invalid={nameTaken}
								aria-describedby="name-error"
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								{t("addDepartment.name")}
								<span className="text-[#D81212]">*</span>
							</label>
							{nameTaken && (
								<p
									id="name-error"
									className="text-red-600 text-sm mt-1 select-none"
								>
									{t("addDepartment.duplicateTitle")}
								</p>
							)}
						</div>
					</div>

					<Separator />

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="bg-gray-300 text-black px-4 py-2 rounded-[3px] hover:bg-gray-400 hover:cursor-pointer transition-colors duration-200"
						>
							{t("actionsDep.cancel")}
						</button>
						<button
							type="submit"
							disabled={nameTaken || checking}
							className={`bg-black text-white px-4 py-2 rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200 ${
								nameTaken || checking ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{t("actionsDep.submit")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddDepartmentDialog;
