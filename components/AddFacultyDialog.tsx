import React from "react";
import { Separator } from "./ui/separator";
import { X } from "lucide-react";

const AddFacultyDialog = ({ onClose }: { onClose: () => void }) => {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// handle submit logic
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

				<h2 className="text-xl font-semibold">Add a new faculty</h2>

				<form onSubmit={handleSubmit} className="space-y-4 mt-2">
					<Separator />
					<div className="flex gap-4 w-full">
						<div className="relative w-full">
							<input
								type="text"
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm transition-all duration-200 peer-focus:text-black dark:peer-focus:text-white">
								Name
								<span className="text-[#D81212]">*</span>
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

export default AddFacultyDialog;
