"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { X, Loader2 } from "lucide-react";
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
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		let isActive = true;

		if (!name.trim()) {
			setNameTaken(false);
			setChecking(false);
			return;
		}

		// Set checking immediately to disable the button while debouncing
		setChecking(true);

		const delayDebounce = setTimeout(async () => {
			try {
				const taken = await isDepartmentNameTaken(name.trim(), facultyId);
				if (isActive) {
					setNameTaken(taken);
				}
			} catch (error) {
				if (isActive) setNameTaken(false);
			} finally {
				if (isActive) setChecking(false);
			}
		}, 500);

		return () => {
			isActive = false;
			clearTimeout(delayDebounce);
		};
	}, [name, facultyId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();

		if (!trimmedName) {
			toast.error(t("addDepartment.nameRequired"));
			return;
		}

		if (nameTaken || checking || submitting) return;

		setSubmitting(true);
		try {
			await addDepartment({
				name: trimmedName,
				code: trimmedName.substring(0, 3).toUpperCase(),
				facultyId,
			});
			toast.success(t("addDepartment.success"));
			onClose();
		} catch (error) {
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
		} finally {
			setSubmitting(false);
		}
	};

	const isInvalid = nameTaken || checking || submitting || !name.trim();

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
			<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md p-4 relative">
				{/* Close Button */}
				<button
					onClick={onClose}
					className={`text-gray-400 absolute top-3 ${
						isRtl ? "left-3" : "right-3"
					} hover:text-gray-900 dark:hover:text-white transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800`}
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header Section */}
				<div className="mb-5">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
						{t("addDepartment.title")}
					</h2>
					<p className="text-sm text-zinc-500 dark:text-gray-400 mt-1 leading-relaxed">
						{t("addDepartment.subtitle")}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4" noValidate>
					<div className="relative w-full">
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className={`peer w-full h-16 bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 focus:outline-none transition-colors ${
								nameTaken
									? "border-red-600 focus:border-red-600"
									: "focus:border-black dark:focus:border-white"
							}`}
							placeholder=" "
							dir={isRtl ? "rtl" : "ltr"}
							aria-invalid={nameTaken}
						/>
						<label
							className={`absolute top-2 ${isRtl ? "right-3" : "left-3"} text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white`}
						>
							{t("addDepartment.name")}
							<span className="text-[#D81212] ml-1">*</span>
						</label>

						{/* Validation Messages */}
						<div className=" mt-1">
							{checking ? (
								<p className="text-gray-500 text-xs flex items-center gap-1">
									<Loader2 className="w-3 h-3 animate-spin" />
									{t("addDepartment.checking", "Checking availability...")}
								</p>
							) : nameTaken ? (
								<p className="text-red-600 text-sm select-none">
									{t("addDepartment.duplicateTitle")}
								</p>
							) : null}
						</div>
					</div>

					<Separator />

					<div className="flex items-center gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50/40 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
						>
							{t("actionsDep.cancel")}
						</button>

						<button
							type="submit"
							disabled={isInvalid}
							className={`flex-[1.5] border relative overflow-hidden px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                                ${
																	isInvalid
																		? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
																		: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:shadow-lg hover:shadow-zinc-900/20 active:scale-[0.98]"
																}
                            `}
						>
							<span className="flex items-center justify-center gap-2">
								{submitting && <Loader2 className="w-4 h-4 animate-spin" />}
								{t("actionsDep.submit")}
							</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddDepartmentDialog;
