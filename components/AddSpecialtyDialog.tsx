"use client";

import React, { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { X } from "lucide-react";
import {
	addSpecialty,
	isSpecialtyNameTaken,
} from "../app/src/services/specialtyService";
import { toast } from "sonner";

interface AddSpecialtyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	majorId: string | null;
}

const AddSpecialtyDialog = ({
	open,
	onOpenChange,
	majorId,
}: AddSpecialtyDialogProps) => {
	const [name, setName] = useState("");
	const [nameTaken, setNameTaken] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const checkName = async () => {
			if (!name.trim()) {
				setNameTaken(false);
				return;
			}

			if (!majorId) {
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
			toast.error("Specialty name is required.");
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
							A major with this name already exists.
						</div>
						<div className="text-sm">Please choose a different name.</div>
					</div>
				</div>
			);
			return;
		}

		try {
			await addSpecialty({
				name,
				majorId,
			});

			toast.success("Specialty added successfully!");
			onOpenChange(false); // close dialog
			setName(""); // clear input
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
		} catch (error: any) {
			toast.error(
				<div className="flex items-center gap-2">
					<div>
						<div className="font-semibold">An error occurred.</div>
						<div className="text-sm">Please try again later.</div>
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
					onClick={() => onOpenChange(false)}
					className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white hover:cursor-pointer"
				>
					<X />
				</button>

				<h2 className="text-xl font-semibold">Add a new specialty</h2>

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
								aria-invalid={nameTaken}
								aria-describedby="name-error"
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								Name
								<span className="text-[#D81212]">*</span>
							</label>
							{nameTaken && (
								<p
									id="name-error"
									className="text-red-600 text-sm mt-1 select-none"
								>
									A specialtie with this name already exists.
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
							Cancel
						</button>
						<button
							type="submit"
							disabled={nameTaken}
							className={`bg-black text-white px-4 py-2 rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200 ${
								nameTaken ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddSpecialtyDialog;
