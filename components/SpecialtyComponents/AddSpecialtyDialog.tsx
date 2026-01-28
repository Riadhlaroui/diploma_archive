"use client";

import React, { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Loader2, X } from "lucide-react";
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
	const [checking, setChecking] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		let isActive = true;

		if (!name.trim() || !majorId) {
			setNameTaken(false);
			setChecking(false);
			return;
		}

		setChecking(true);

		const delayDebounce = setTimeout(async () => {
			try {
				const taken = await isSpecialtyNameTaken(name, majorId);
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
	}, [name, majorId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();

		if (!trimmedName) {
			toast.error(t("addSpecialty.errors.nameRequired"));
			return;
		}

		if (!majorId) {
			toast.error("Major ID is required.");
			return;
		}

		if (nameTaken || checking || submitting) return;

		setSubmitting(true);
		try {
			await addSpecialty({
				name: trimmedName,
				majorId,
			});

			toast.success(t("addSpecialty.success"));

			// Reset and Close
			setName("");
			onClose();
			onOpenChange(false);
		} catch (error: any) {
			toast.error(
				<div className="flex flex-col">
					<span className="font-semibold">
						{t("addSpecialty.errors.general.title")}
					</span>
					<span className="text-sm">
						{t("addSpecialty.errors.general.desc")}
					</span>
				</div>,
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (!open) return null;

	const isInvalid = nameTaken || checking || submitting || !name.trim();

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
			<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md p-4 relative">
				<button
					onClick={onClose}
					className={`text-gray-400 absolute top-3 ${
						isRtl ? "left-3" : "right-3"
					} hover:text-gray-900 dark:hover:text-white transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800`}
				>
					<X className="w-5 h-5" />
				</button>

				<div className="mb-5">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
						{t("addSpecialty.title")}
					</h2>
					<p className="text-sm text-zinc-500 dark:text-gray-400 mt-1 leading-relaxed">
						{t("addSpecialty.subtitle", "Provide a name for the specialty..")}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
					<Separator />
					<div className="flex gap-4 w-full">
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
								dir={isRtl ? "rtl" : "ltr"}
								placeholder=""
								aria-invalid={nameTaken}
								aria-describedby="name-error"
							/>
							<label
								className={`absolute top-2 ${isRtl ? "right-3" : "left-3"} text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white`}
							>
								{t("addSpecialty.nameLabel")}
								<span className="text-[#D81212]">*</span>
							</label>
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

export default AddSpecialtyDialog;
