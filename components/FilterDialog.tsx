// components/FilterDialog.tsx
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
				className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Dialog Panel */}
			<div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* 1. Header Section */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Filter Options
					</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-white"
					>
						<X className="w-4 h-4" />
					</Button>
				</div>

				{/* 2. Content Section */}
				<div className="p-6 space-y-4 border-b border-gray-100 dark:border-zinc-800">
					{/* Input Group 1 */}
					<div className="space-y-2">
						<label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
							Student Name
						</label>
						<input
							type="text"
							placeholder="Search by name..."
							className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-700/50"
						/>
					</div>

					{/* Input Group 2 */}
					<div className="space-y-2">
						<label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
							Department
						</label>
						<input
							type="text"
							placeholder="e.g. Computer Science"
							className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-700/50"
						/>
					</div>
				</div>

				{/* 3. Footer Section */}
				<div className="flex justify-end gap-3 px-6 py-4 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
					<Button
						variant="ghost"
						onClick={onClose}
						className="hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300"
					>
						Cancel
					</Button>
					<Button
						className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
						onClick={() => onApply({})}
					>
						Apply Filters
					</Button>
				</div>
			</div>
		</div>
	);
}
