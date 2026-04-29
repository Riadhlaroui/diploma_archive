"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";

type YearPickerProps = {
	value: string | number | null;
	onChange: (year: string) => void;
	min?: number;
	max?: number;
	placeholder?: string;
	clearable?: boolean;
	className?: string;
};

export function YearPicker({
	value,
	onChange,
	min = 1900,
	max = new Date().getFullYear(),
	placeholder = "Select year",
	clearable = false,
	className = "",
}: YearPickerProps) {
	const [open, setOpen] = useState(false);
	const [rangeStart, setRangeStart] = useState(() => {
		const selected = value ? Number(value) : new Date().getFullYear();
		return Math.floor(selected / 16) * 16;
	});

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node))
				setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const years = Array.from({ length: 16 }, (_, i) => rangeStart + i).filter(
		(y) => y >= min && y <= max,
	);

	const selected = value ? Number(value) : null;
	const canGoPrev = rangeStart - 16 >= min;
	const canGoNext = rangeStart + 16 <= max;

	return (
		<div ref={ref} className={`relative ${className}`}>
			{/* Trigger */}
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex items-center gap-2 w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
			>
				<span
					className={`flex-1 text-left ${selected ? "text-gray-900" : "text-gray-400"}`}
				>
					{selected ?? placeholder}
				</span>
				<div className="flex items-center gap-1">
					{clearable && selected && (
						<span
							role="button"
							onClick={(e) => {
								e.stopPropagation();
								onChange("");
							}}
							className="text-gray-300 hover:text-gray-500 transition-colors"
						>
							<X className="w-3.5 h-3.5" />
						</span>
					)}
					<ChevronDown
						className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
					/>
				</div>
			</button>

			{/* Popover */}
			{open && (
				<div
					className="absolute z-50 mt-1.5 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64 select-none"
					dir="ltr"
				>
					{/* Range navigation */}
					<div className="flex items-center justify-between mb-3">
						<button
							type="button"
							disabled={!canGoPrev}
							onClick={() => setRangeStart((r) => r - 16)}
							className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronLeft className="w-4 h-4 text-gray-500" />
						</button>
						<span className="text-sm font-semibold text-gray-700">
							{rangeStart} – {Math.min(rangeStart + 15, max)}
						</span>
						<button
							type="button"
							disabled={!canGoNext}
							onClick={() => setRangeStart((r) => r + 16)}
							className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronRight className="w-4 h-4 text-gray-500" />
						</button>
					</div>

					{/* Year grid */}
					<div className="grid grid-cols-4 gap-1.5">
						{years.map((year) => {
							const isSelected = year === selected;
							const isCurrent = year === new Date().getFullYear();

							return (
								<button
									key={year}
									type="button"
									onClick={() => {
										onChange(String(year));
										setOpen(false);
									}}
									className={`
                    py-2 rounded-lg text-sm font-medium transition-all
                    ${
											isSelected
												? "bg-gray-900 text-white"
												: isCurrent
													? "text-blue-600 font-semibold hover:bg-gray-100"
													: "text-gray-700 hover:bg-gray-100"
										}
                  `}
								>
									{year}
								</button>
							);
						})}
					</div>

					{/* Jump to current year */}
					{!selected &&
						new Date().getFullYear() >= min &&
						new Date().getFullYear() <= max && (
							<button
								type="button"
								onClick={() => {
									const current = new Date().getFullYear();
									setRangeStart(Math.floor(current / 16) * 16);
								}}
								className="mt-3 w-full text-center text-xs font-medium text-gray-400 hover:text-gray-700 py-1 rounded-lg hover:bg-gray-100 transition-colors"
							>
								Current year
							</button>
						)}
				</div>
			)}
		</div>
	);
}
