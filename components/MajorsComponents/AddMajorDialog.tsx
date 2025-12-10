/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { toast } from "sonner";
import { addMajor, isMajorNameTaken } from "@/app/src/services/majorService"; // Update path as needed

const AddMajorDialog = ({
	onClose,
	fieldId,
}: {
	onClose: () => void;
	fieldId: string;
}) => {
	const { t, i18n } = useTranslation();

	const isRtl = i18n.language === "ar";

	const [name, setName] = useState("");
	const [nameTaken, setNameTaken] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const checkName = async () => {
			if (!name.trim()) {
				setNameTaken(false);
				return;
			}
			try {
				const taken = await isMajorNameTaken(name, fieldId);
				if (isMounted) setNameTaken(taken);
			} catch {
				if (isMounted) setNameTaken(false);
			}
		};

		checkName();

		return () => {
			isMounted = false;
		};
	}, [name, fieldId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error(t("addMajor.errors.nameRequired"));
			return;
		}

		if (nameTaken) {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold text-[15px]">
							{t("addMajor.errors.nameTaken.title")}
						</div>
						<div className="text-sm">{t("addMajor.errors.nameTaken.desc")}</div>
					</div>
				</div>
			);
			return;
		}

		try {
			await addMajor(name, fieldId);
			toast.success(t("addMajor.success"));
			onClose();
		} catch (error: any) {
			console.log("PocketBase Validation Error:", error.data);

			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold">
							{t("addMajor.errors.general.title")}
						</div>
						<div className="text-sm">{t("addMajor.errors.general.desc")}</div>
					</div>
				</div>
			);
		}
	};

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

				<h2 className="text-xl font-semibold">{t("addMajor.title")}</h2>

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
								{t("addMajor.nameLabel")}
								<span className="text-[#D81212]">*</span>
							</label>
							{nameTaken && (
								<p
									id="name-error"
									className="text-red-600 text-sm mt-1 select-none"
								>
									{t("addMajor.errors.nameTaken.title")}
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
							{t("addMajor.cancel")}
						</button>
						<button
							type="submit"
							disabled={nameTaken}
							className={`bg-black text-white px-4 py-2 rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200 ${
								nameTaken ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{t("addMajor.submit")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddMajorDialog;
