"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";

type DatePickerProps = {
	value: string | null; // "YYYY-MM-DD" or null
	onChange: (value: string | null) => void;
	min?: string; // "YYYY-MM-DD"
	max?: string; // "YYYY-MM-DD"
	placeholder?: string;
	clearable?: boolean;
	className?: string;
};

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
	value,
	onChange,
	min,
	max,
	placeholder = "Select a date",
	clearable = true,
	className = "",
}: DatePickerProps) {
	const today = new Date();
	const parsed = value ? new Date(value + "T00:00:00") : null;

	const [open, setOpen] = useState(false);
	const [viewYear, setViewYear] = useState(
		parsed?.getFullYear() ?? today.getFullYear(),
	);
	const [viewMonth, setViewMonth] = useState(
		parsed?.getMonth() ?? today.getMonth(),
	);
	const [mode, setMode] = useState<"calendar" | "month" | "year">("calendar");

	const ref = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node))
				setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const minDate = min ? new Date(min + "T00:00:00") : null;
	const maxDate = max ? new Date(max + "T00:00:00") : null;

	const isDisabled = (d: Date) => {
		if (minDate && d < minDate) return true;
		if (maxDate && d > maxDate) return true;
		return false;
	};

	const selectDate = (d: Date) => {
		if (isDisabled(d)) return;
		const iso = [
			d.getFullYear(),
			String(d.getMonth() + 1).padStart(2, "0"),
			String(d.getDate()).padStart(2, "0"),
		].join("-");
		onChange(iso);
		setOpen(false);
		setMode("calendar");
	};

	const prevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear((y) => y - 1);
		} else setViewMonth((m) => m - 1);
	};
	const nextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear((y) => y + 1);
		} else setViewMonth((m) => m + 1);
	};

	// Build calendar grid
	const firstDay = new Date(viewYear, viewMonth, 1).getDay();
	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
	const cells: (number | null)[] = [
		...Array(firstDay).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];
	while (cells.length % 7 !== 0) cells.push(null);

	const displayValue = parsed
		? parsed.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: null;

	// Year range for year picker
	const yearStart = Math.floor(viewYear / 12) * 12;
	const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

	return (
		<div ref={ref} className={`relative ${className}`}>
			{/* Trigger */}
			<button
				type="button"
				onClick={() => {
					setOpen((o) => !o);
					setMode("calendar");
				}}
				className="flex items-center gap-2 w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
			>
				<CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
				<span
					className={
						displayValue ? "text-gray-900 flex-1" : "text-gray-400 flex-1"
					}
				>
					{displayValue ?? placeholder}
				</span>
				{clearable && parsed && (
					<span
						role="button"
						onClick={(e) => {
							e.stopPropagation();
							onChange(null);
						}}
						className="text-gray-300 hover:text-gray-500 transition-colors"
					>
						<X className="w-3.5 h-3.5" />
					</span>
				)}
			</button>

			{/* Popover */}
			{open && (
				<div className="absolute z-50 mt-1.5 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-72 select-none">
					{/* ── Calendar view ── */}
					{mode === "calendar" && (
						<>
							<div className="flex items-center justify-between mb-3">
								<button
									type="button"
									onClick={prevMonth}
									className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<ChevronLeft className="w-4 h-4 text-gray-500" />
								</button>

								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => setMode("month")}
										className="text-sm font-semibold text-gray-800 hover:text-black hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
									>
										{MONTHS[viewMonth]}
									</button>
									<button
										type="button"
										onClick={() => setMode("year")}
										className="text-sm font-semibold text-gray-800 hover:text-black hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
									>
										{viewYear}
									</button>
								</div>

								<button
									type="button"
									onClick={nextMonth}
									className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<ChevronRight className="w-4 h-4 text-gray-500" />
								</button>
							</div>

							{/* Day headers */}
							<div className="grid grid-cols-7 mb-1">
								{DAYS.map((d) => (
									<div
										key={d}
										className="text-center text-[11px] font-medium text-gray-400 py-1"
									>
										{d}
									</div>
								))}
							</div>

							{/* Day cells */}
							<div className="grid grid-cols-7 gap-y-0.5">
								{cells.map((day, i) => {
									if (!day) return <div key={i} />;
									const cellDate = new Date(viewYear, viewMonth, day);
									const disabled = isDisabled(cellDate);
									const isToday =
										cellDate.toDateString() === today.toDateString();
									const selected =
										parsed && cellDate.toDateString() === parsed.toDateString();

									return (
										<button
											key={i}
											type="button"
											disabled={disabled}
											onClick={() => selectDate(cellDate)}
											className={`
                        h-8 w-full rounded-lg text-sm font-medium transition-all
                        ${disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}
                        ${isToday && !selected ? "text-blue-600 font-semibold" : ""}
                        ${selected ? "bg-gray-900 text-white hover:bg-gray-700" : ""}
                      `}
										>
											{day}
										</button>
									);
								})}
							</div>

							{/* Today shortcut */}
							{!isDisabled(today) && (
								<button
									type="button"
									onClick={() => selectDate(today)}
									className="mt-3 w-full text-center text-xs font-medium text-gray-500 hover:text-gray-900 py-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									Today
								</button>
							)}
						</>
					)}

					{/* ── Month picker ── */}
					{mode === "month" && (
						<>
							<div className="flex items-center justify-between mb-3">
								<button
									type="button"
									onClick={() => setViewYear((y) => y - 1)}
									className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<ChevronLeft className="w-4 h-4 text-gray-500" />
								</button>
								<button
									type="button"
									onClick={() => setMode("year")}
									className="text-sm font-semibold text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
								>
									{viewYear}
								</button>
								<button
									type="button"
									onClick={() => setViewYear((y) => y + 1)}
									className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<ChevronRight className="w-4 h-4 text-gray-500" />
								</button>
							</div>
							<div className="grid grid-cols-3 gap-1.5">
								{MONTHS.map((m, i) => (
									<button
										key={m}
										type="button"
										onClick={() => {
											setViewMonth(i);
											setMode("calendar");
										}}
										className={`
                      py-2 rounded-lg text-sm font-medium transition-all
                      ${viewMonth === i ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"}
                    `}
									>
										{m.slice(0, 3)}
									</button>
								))}
							</div>
						</>
					)}

					{/* ── Year picker ── */}
					{mode === "year" && (
						<>
							<div className="flex items-center justify-between mb-3">
								<button
									type="button"
									onClick={() => setViewYear((y) => y - 12)}
									className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<ChevronLeft className="w-4 h-4 text-gray-500" />
								</button>
								<span className="text-sm font-semibold text-gray-800">
									{yearStart} – {yearStart + 11}
								</span>
								<button
									type="button"
									onClick={() => setViewYear((y) => y + 12)}
									className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<ChevronRight className="w-4 h-4 text-gray-500" />
								</button>
							</div>
							<div className="grid grid-cols-3 gap-1.5">
								{years.map((yr) => (
									<button
										key={yr}
										type="button"
										onClick={() => {
											setViewYear(yr);
											setMode("month");
										}}
										className={`
                      py-2 rounded-lg text-sm font-medium transition-all
                      ${viewYear === yr ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"}
                    `}
									>
										{yr}
									</button>
								))}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
