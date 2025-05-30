// components/FilterDialog.tsx
import { X } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust to your project structure

interface FilterDialogProps {
	open: boolean;
	onClose: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onApply: (filters: any) => void;
}

export function FilterDialog({ open, onClose, onApply }: FilterDialogProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/30 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Dialog Panel */}
			<div className="relative bg-white dark:bg-zinc-900 p-6 rounded-lg w-full max-w-md shadow-xl z-50">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Title */}
				<h2 className="text-lg font-semibold mb-4">Filter Options</h2>

				{/* Filter Fields */}
				<div className="flex flex-col gap-4">
					<input
						type="text"
						placeholder="Name"
						className="border p-2 rounded dark:bg-zinc-800 dark:text-white"
					/>
					<input
						type="text"
						placeholder="Department"
						className="border p-2 rounded dark:bg-zinc-800 dark:text-white"
					/>
					{/* Add more fields here */}
				</div>

				{/* Action Buttons */}
				<div className="mt-6 flex justify-end gap-2">
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button
						className="bg-blue-600 text-white hover:bg-blue-700"
						onClick={() => onApply({})}
					>
						Apply Filters
					</Button>
				</div>
			</div>
		</div>
	);
}
