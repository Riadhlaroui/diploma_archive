"use client";

import React, { useState } from "react";
import { Separator } from "./ui/separator";
import { X } from "lucide-react";
import { addSpecialty } from "../app/src/services/specialtyService"; // Replace with your actual path
import { toast } from "sonner";

const AddSpecialtyDialog = ({
	onClose,
	departmentId,
}: {
	onClose: () => void;
	departmentId: string;
}) => {
	const [name, setName] = useState("");
	const [major, setMajor] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Specialty name is required.");
			return;
		}

		try {
			await addSpecialty({
				name,
				major,
				departmentId,
			});

			toast.success("Specialty added successfully!");
			onClose();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.response?.status === 400) {
				toast.error(
					<div className="flex items-center gap-2">
						<div>
							<div className="font-semibold text-[15px]">
								A specialty with this name already exists.
							</div>
							<div className="text-sm">Please choose a different name.</div>
						</div>
					</div>
				);
			} else {
				toast.error(
					<div className="flex items-center gap-2">
						<div>
							<div className="font-semibold">An error occurred.</div>
							<div className="text-sm">Please try again later.</div>
						</div>
					</div>
				);
			}
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white dark:bg-gray-900 rounded-[3px] shadow-lg w-full max-w-md p-6 relative">
				<button
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white hover:cursor-pointer"
				>
					<X />
				</button>

				<h2 className="text-xl font-semibold">Add a new specialty</h2>

				<form onSubmit={handleSubmit} className="space-y-4 mt-2">
					<Separator />
					<div className="flex gap-4 w-full">
						<div className="relative w-full">
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								Name<span className="text-[#D81212]">*</span>
							</label>
						</div>
					</div>

					<div className="flex gap-4 w-full">
						<div className="relative w-full">
							<input
								type="text"
								value={major}
								onChange={(e) => setMajor(e.target.value)}
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								Major
							</label>
						</div>
					</div>

					<Separator />

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="bg-gray-300 text-black px-4 py-2 rounded-[3px] hover:bg-gray-400 hover:cursor-pointer transition-colors duration-200"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="bg-black text-white px-4 py-2 rounded-[3px] hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200"
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
